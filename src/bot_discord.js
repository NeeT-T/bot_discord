import { search as searchYoutubeVideoByName } from './services/YoutubeAccess.js';
import { Client } from 'discord.js';
import dotenv from 'dotenv';
import ytdl from 'ytdl-core';
dotenv.config();

const CHANNEL_GERAL = process.env.DISCORD_VOICE_CHANNEL_ID;
const CHANNEL_ENABLE_TO_COMMAND = process.env.DISCORD_ENABLE_MASSAGE_CHANNEL_ID;
let isPlaying = false;
const SONG_LIST_NAMES = [];

const bot = new Client();
const musicOptions = { seek: 0, volume: 1, plp: 0, fec: true };

bot.login(process.env.TOKEN_BOT_DISCORD);

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async (msg) => {
  console.log(`Message from ${msg.author.username}: ${msg}`);
  console.log(`Message channel: ${msg.channel.id}`, msg);
  // Prevent commands from bots and check channel
  if (msg.author.bot || msg.channel.id !== CHANNEL_ENABLE_TO_COMMAND) return;

  const voiceChannel = msg.guild.channels.cache.get(CHANNEL_GERAL);
  if (!voiceChannel) {
    console.log('Voice channel not found.');
    return;
  }

  const [command, ...args] = msg.content.trim().toLowerCase().split(' ');

  switch (command) {
    case '!play': {
      const musicTitle = args.join(' ').trim();
      if (musicTitle) {
        SONG_LIST_NAMES.push(musicTitle);
        if (!isPlaying) {
          await searchMusicByNameOnYoutube(voiceChannel, SONG_LIST_NAMES[0]);
        }
      }
      break;
    }
    case '!next':
      await nextMusic(voiceChannel);
      break;
    case '!list':
      if (SONG_LIST_NAMES.length) {
        SONG_LIST_NAMES.forEach((music, index) => {
          msg.channel.send(index === 0 ? `${music} - Now Playing` : music);
        });
      } else {
        msg.channel.send('No songs in the playlist.');
      }
      break;
    default:
      break;
  }
});

const searchMusicByNameOnYoutube = async (voiceChannel, nameToSearch) => {
  if (!nameToSearch) return;
  try {
    isPlaying = true;
    const result = await searchYoutubeVideoByName(nameToSearch);
    const videoId = result?.data?.items[0]?.id?.videoId;
    await startMusic(voiceChannel, videoId);
  } catch (error) {
    console.error('Error searching music:', error);
    isPlaying = false;
  }
};

const startMusic = async (voiceChannel, videoId) => {
  try {
    if (videoId) {
      const connection = await voiceChannel.join();
      const musicStream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, { filter: 'audioonly' });
      const dispatcher = connection.play(musicStream, musicOptions);
      dispatcher.on('finish', async () => {
        await nextMusic(voiceChannel);
      });
    } else {
      isPlaying = false;
    }
  } catch (error) {
    console.error('Error starting music:', error);
    isPlaying = false;
  }
};

const nextMusic = async (voiceChannel) => {
  SONG_LIST_NAMES.shift();
  if (SONG_LIST_NAMES.length) {
    await searchMusicByNameOnYoutube(voiceChannel, SONG_LIST_NAMES[0]);
  } else {
    isPlaying = false;
    voiceChannel.leave();
  }
};
