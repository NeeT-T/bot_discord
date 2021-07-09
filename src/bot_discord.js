const Discord = require('discord.js');
require('dotenv').config();

const clientBot = new Discord.Client();
const ytdl = require('ytdl-core');
const musicOptions = {seek: 0, volume: 1};

const CHANNEL_GERAL = process.env.DISCORD_VOICE_CHANNEL_ID;

clientBot.login(process.env.TOKEN_BOT_DISCORD);

clientBot.on('ready', () => {
  console.log(`Logged in as ${clientBot.user.tag}!`);
});

clientBot.on('message', (msg) => {
  if (msg.author.clientBot) return;
  // console.log(msg.guild.channels.cache);
  if (msg.content.toLowerCase().startsWith('!play')) {
    const voiceChannel = msg.guild.channels.cache
        .find((channels) => channels.id === CHANNEL_GERAL);
    if (voiceChannel === null) {
      console.log('Voice channel not find');
      return;
    } else {
      voiceChannel.join()
          .then((connection) => {
            const music = ytdl('https://www.youtube.com/watch?v=wqS55NBihCc&ab_channel=MartinPeralta', {filter: 'audioonly'});
            const DJ = connection.play(music, musicOptions);
            DJ.on('end', (end) => {
              console.log('Acabou de tocar');
            // voiceChannel.leave();
            });
          })
          .catch(console.error);
    }
  }
});

