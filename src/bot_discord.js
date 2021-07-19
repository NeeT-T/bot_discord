import {search as searchYoutubeVideoByName} from './services/YoutubeAccess.js';
import {Client} from 'discord.js';
import {} from 'dotenv/config';
import ytdl from 'ytdl-core';

const CHANNEL_GERAL = process.env.DISCORD_VOICE_CHANNEL_ID;
const CHANNEL_ENABLE_TO_COMMAND = process.env.DISCORD_ENABLE_MASSAGE_CHANNEL_ID;
let isPlaying = false;
const SONG_LIST_NAMES = [];

const bot = new Client();
const musicOptions = {seek: 0, volume: 1, plp: 0, fec: true};

bot.login(process.env.TOKEN_BOT_DISCORD);

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async (msg) => {
  if (msg?.author?.bot ||
    msg?.channel?.id !== CHANNEL_ENABLE_TO_COMMAND) {
    return;
  } else {
    const voiceChannel = msg?.guild?.channels?.cache
        .find((channels) => channels?.id === CHANNEL_GERAL);
    const value = msg?.content?.trim()?.toLowerCase()?.split(' ');
    switch (value[0]) {
      case '!play':
        value.shift();
        if (voiceChannel) {
          const musicTitle = value?.join(' ')?.trim()?.toLowerCase() ?? null;
          if (musicTitle) {
            SONG_LIST_NAMES.push(musicTitle);
            if (bot?.voice?.connections?.find((connection) =>
              connection?.channel?.id === CHANNEL_GERAL)) {
              if (!isPlaying) {
                await searchMusicByNameOnYoutube(voiceChannel,
                    SONG_LIST_NAMES[0]);
              }
            } else {
              await searchMusicByNameOnYoutube(voiceChannel,
                  SONG_LIST_NAMES[0]);
            }
          } else {
            return;
          }
        } else {
          console.log(`Voice channel not found`);
          return;
        }
        break;
      case '!next':
        await nextMusic(voiceChannel);
        break;
      case '!list':
        SONG_LIST_NAMES?.length ?
          SONG_LIST_NAMES?.map((music, index) => {
          index === 0 ?
              msg?.channel?.send(`${music} - Play now`) :
              msg?.channel?.send(`${music}`);
          }) :
          msg?.channel?.send('Não a nenhuma musica na lista de reprodução');
        break;
      case '':
        break;
    }
  }
});

const searchMusicByNameOnYoutube = async (voiceChannel,
    nameToSearch = null) => {
  if (!nameToSearch) return;
  try {
    isPlaying = true;
    const result = await searchYoutubeVideoByName(nameToSearch);
    const videoId = result?.data?.items[0]?.id?.videoId ?? null;
    await startMusic(voiceChannel, videoId);
  } catch (error) {
    console.error(error);
  }
};

const startMusic = async (voiceChannel, videoId = null) => {
  try {
    if (videoId) {
      const connection = await voiceChannel.join();
      const music = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {filter: 'audioonly'});
      const dispatcher = connection.play(music, musicOptions);
      dispatcher.on('finish', async () => {
        await nextMusic(voiceChannel);
      });
    } else { // if not music found
      isPlaying = false;
      return;
    }
  } catch (error) {
    console.error(error);
  }
};

const nextMusic = async (voiceChannel) => {
  SONG_LIST_NAMES.shift();
  if (SONG_LIST_NAMES?.length) {
    await searchMusicByNameOnYoutube(voiceChannel, SONG_LIST_NAMES[0]);
  } else {
    isPlaying = false;
    await voiceChannel.leave();
  }
};
