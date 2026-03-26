require('dotenv').config();
const ffmpeg = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpeg;

const { Client, GatewayIntentBits } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus 
} = require('@discordjs/voice');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('clientReady', () => {
  console.log('Bot encendido 🔥');
});

// 🎯 Mapa usuario → sonido
const sonidos = {
  "434742097417863172": "./sonidos/oscar.mp3", 
  "631159167050055681": "./sonidos/maria.mp3",
  "754430285084622970": "./sonidos/selene.mp3",
  "395216229855395843": "./sonidos/javi.mp3",
  "1175549121206173911": "./sonidos/alicia.mp3",
  "399989379197698049": "./sonidos/victor.mp3",
  "753587351124443246": "./sonidos/lore.mp3",
  "1001972281288962140": "./sonidos/hannie.mp3",
  "1001971933669249125": "./sonidos/suneo.mp3",
};

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (!oldState.channel && newState.channel) {

    // 🚫 Ignorar bots (MUY IMPORTANTE)
    if (newState.member.user.bot) return;

    const userId = newState.id;

    const rutaSonido = sonidos[userId] || "./audio.mp3";

    console.log("ID detectado:", userId);
    console.log("Reproduciendo:", rutaSonido);

    try {
      const connection = joinVoiceChannel({
        channelId: newState.channel.id,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(rutaSonido);

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

    } catch (error) {
      console.log(error);
    }
  }
});

client.login(process.env.TOKEN);