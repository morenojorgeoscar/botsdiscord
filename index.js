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
  console.log('Bot encendido');
});

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

let cola = [];
let reproduciendo = false;
let conexionActual = null;
let playerActual = null;

async function reproducirSiguiente(guild, channelId) {

  if (cola.length === 0) {
    reproduciendo = false;
    if (conexionActual) {
      conexionActual.destroy();
      conexionActual = null;
    }
    playerActual = null;
    return;
  }

  reproduciendo = true;
  const rutaSonido = cola.shift();

  try {
    if (!conexionActual) {
      conexionActual = joinVoiceChannel({
        channelId: channelId,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });
    } 

    if (!playerActual) {
      playerActual = createAudioPlayer();
      conexionActual.subscribe(playerActual);

      playerActual.on(AudioPlayerStatus.Idle, () => {
        reproducirSiguiente(guild, channelId);
      });

      playerActual.on('error', (err) => {
      });
    } 

    const resource = createAudioResource(rutaSonido, { inlineVolume: true });
    resource.volume.setVolume(1);
    playerActual.play(resource);

  } catch (error) {
    conexionActual = null;
    playerActual = null;
    reproducirSiguiente(guild, channelId);
  }
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (!oldState.channel && newState.channel) {
    if (newState.member.user.bot) return;

    const userId = newState.id;
    const rutaSonido = sonidos[userId] || "./audio.mp3";

    cola.push(rutaSonido);

    if (!reproduciendo) {
      reproducirSiguiente(newState.guild, newState.channel.id);
    } 
  }
});

client.login(process.env.TOKEN);