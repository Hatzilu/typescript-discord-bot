import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayerStatus, DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { Client, CommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import ytdl from 'ytdl-core';
import { Song } from '../../types';
import { getSongResourceByYouTubeUrl } from '../../utils';
import { serverQueue, player } from './music-utils';

export const data = new SlashCommandBuilder().setName('stream').setDescription('stream a song in VC').addStringOption(option =>
  option
    .setName('url')
    .setDescription('Provide a song URL')
    .setRequired(true));

export async function execute (interaction: CommandInteraction, client: Client): Promise<void> {
  await interaction.deferReply();
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel as VoiceChannel;
  const url = interaction.options.getString('url');

  console.log(url);
  if (url === null) {
    await interaction.editReply('please provide a url!');
    return;
  }
  if (!ytdl.validateURL(url)) {
    await interaction.editReply('Invalid YouTube url!');
    return;
  }
  const connection = getVoiceConnection(voiceChannel.guild.id) ?? joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
  });

  const audioPlayerSubscription = connection.subscribe(player);

  if (audioPlayerSubscription === undefined) {
    await interaction.editReply('Unable to subscribe to AudioPlayer, please open a support ticket.');
    return;
  }

  const newSong: Song = {
    url,
    info: await ytdl.getInfo(url)
  };
  serverQueue.addSongToQueue(newSong);
  interaction.editReply(`Added **${newSong.info.videoDetails.title}** to queue! position in queue: ${serverQueue.getQueuedSongs().length}`).catch(console.error);
  const shouldAddSongToQueue: boolean = player.state.status === AudioPlayerStatus.Idle && serverQueue.getQueuedSongs().length > 0;
  if (shouldAddSongToQueue) {
    const resource = getSongResourceByYouTubeUrl(url);
    player.play(resource);
  }
  console.log('queued songs:', serverQueue.getQueuedSongs().length);
  connection.on(VoiceConnectionStatus.Signalling, () => {
    interaction.editReply('signalling').catch(console.error);
    console.log('signalling');
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('VoiceConnectionStatus: Ready');
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log('VoiceConnectionStatus: Destroyed');
    interaction.editReply('Voice connection destroyed').catch(console.error);
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log('VoiceConnectionStatus: Disconnected');
    interaction.editReply('Disconnected from voice channel!').catch(console.error);
    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
      connection.destroy();
    }
    serverQueue.clear();
    audioPlayerSubscription.unsubscribe();
  });

  player.on(AudioPlayerStatus.Playing, () => {
    interaction.editReply(`Now playing: **${newSong.info.videoDetails.title}** by **${newSong.info.videoDetails.author.name}**`).catch(console.error);
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('player is idle');
    const nextUrl = serverQueue.getNextSong();
    if (nextUrl === null) {
      return;
    }
    const resource = getSongResourceByYouTubeUrl(nextUrl.url);
    player.play(resource);
  });

  player.on('error', console.error);
}
