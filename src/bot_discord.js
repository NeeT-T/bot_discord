import {search as searchYoutubeVideoByName} from './services/YoutubeAccess.js';
import {Client} from 'discord.js';
import {} from 'dotenv/config';
import ytdl from 'ytdl-core';

const CHANNEL_GERAL = process.env.DISCORD_VOICE_CHANNEL_ID;
const CHANNEL_ENABLE_TO_COMMAND = process.env.DISCORD_ENABLE_MASSAGE_CHANNEL_ID;
const SONG_IDS = [];
let dispatcher = null;

const clientBot = new Client();
const musicOptions = {type: 'webm/opus', seek: 0, volume: 1, plp: 0, fec: true};

clientBot.login(process.env.TOKEN_BOT_DISCORD);

clientBot.on('ready', () => {
  console.log(`Logged in as ${clientBot.user.tag}!`);
});

clientBot.on('message', async (msg) => {
  const voiceChannel = msg?.guild?.channels?.cache
      .find((channels) => channels?.id === CHANNEL_GERAL);
  if (msg?.author?.clientBot ||
    msg?.channel?.id !== CHANNEL_ENABLE_TO_COMMAND) {
    return;
  } else if (msg?.content?.trim()?.toLowerCase().startsWith('!play')) {
    try {
      await makeSearch(msg?.content?.split('!play')[1]?.trim() ?? null);
      if (!SONG_IDS?.length) return;
      if (voiceChannel) {
        try {
          if (SONG_IDS?.length === 1) {
            await startMusic(voiceChannel);
          } else return;
          dispatcher.on('finish', async () => {
            SONG_IDS.shift();
            (SONG_IDS?.length) ? await startMusic(voiceChannel) :
              await voiceChannel.leave();
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log(`Voice channel not found`);
        return;
      }
    } catch (error) {
      console.error(error);
    };
  } else if (msg?.content?.trim()?.toLowerCase().startsWith('!next')) {
    if (SONG_IDS?.length > 1) {
      SONG_IDS.shift();
      await startMusic(voiceChannel);
    } else return;
  }
});

const makeSearch = async (nameToSearch = null) => {
  if (!nameToSearch) return;
  try {
    const result = await searchYoutubeVideoByName(nameToSearch);
    const videoId = result?.data?.items[0]?.id?.videoId ?? null;
    (videoId) ? SONG_IDS.push(videoId) : null;
  } catch (error) {
    console.error(error);
  }
};

const startMusic = async (voiceChannel) => {
  try {
    const connection = await voiceChannel.join();
    const music = ytdl(`https://www.youtube.com/watch?v=${SONG_IDS[0]}`, {filter: 'audioonly'});
    dispatcher = connection.play(music, musicOptions);
  } catch (error) {
    console.error(error);
  }
};
