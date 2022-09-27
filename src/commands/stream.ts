import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayerStatus, createAudioPlayer, DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { Client, CommandInteraction, Guild, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import ytdl from 'ytdl-core';
import { ServerQueue } from '../classes/ServerQueue';
import { getSongResourceByYouTubeUrl } from '../utils';

const player = createAudioPlayer();
export const data = new SlashCommandBuilder().setName('stream').setDescription('stream a song in VC').addStringOption(option =>
  option
    .setName('url')
    .setDescription('Provide a song URL')
    .setRequired(true));

export async function execute (interaction: CommandInteraction, client: Client, serverQueue: ServerQueue): Promise<void> {
  await interaction.deferReply();
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel as VoiceChannel;
  // const textChannel = interaction.channel as TextChannel;
  // const guild = interaction.guild as Guild;
  const url = interaction.options.getString('url');
  console.log(url);
  if (url === null) {
    await interaction.editReply('please provide a valid url!');
    return;
  }
  if (!ytdl.validateURL(url)) {
    await interaction.editReply('Invalid YouTube url!');
    return;
  }
  const resource = await getSongResourceByYouTubeUrl(url);
  let connection = getVoiceConnection(voiceChannel.guild.id);
  if (connection === undefined) {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
    });
  }

  connection.subscribe(player);
  if (serverQueue.getQueuedSongs().length > 0) {
    serverQueue.addSongToQueue(resource);
    interaction.editReply(`added to queue! current songs in queue: ${serverQueue.getQueuedSongs().length}`).catch(console.error);
    return;
  }
  console.log('queued songs: ', serverQueue.getQueuedSongs().length);
  connection.on(VoiceConnectionStatus.Signalling, () => {
    interaction.editReply('signalling').catch(console.error);
    console.log('signalling');
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('VoiceConnectionStatus: Ready');
    interaction.editReply(`playing ${url}`).catch(console.error);
    serverQueue.addSongToQueue(resource);
    const nextSong = serverQueue.getNextSong();
    if (nextSong !== null) {
      player.play(nextSong);
    }
  });
  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log('VoiceConnectionStatus: Destroyed');
    interaction.editReply('Voice connection destroyed').catch(console.error);
  });
  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log('VoiceConnectionStatus: Disconnected');
    interaction.editReply('Disconnected from voice channel!').catch(console.error);
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('player is idle');
    const nextSong = serverQueue.getNextSong();
    if (nextSong === null) {
      interaction.editReply('There are no more songs to play!').catch(console.error);
      return;
    }
    player.play(nextSong);
    interaction.editReply('Playing new song!').catch(console.error);
  });

  player.on('error', console.error);
}

async function playSong (member: GuildMember, voiceChannel: VoiceChannel, textChannel: TextChannel, guild: Guild, args: string[]): Promise<void> {
  // TODO
}
