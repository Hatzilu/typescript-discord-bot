import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayerStatus } from '@discordjs/voice';
import { Client, CommandInteraction, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import ytdl from 'ytdl-core';
import { Song } from '../../types';
import { getSongResourceByYouTubeUrl } from '../../utils';
import { serverQueue, player, connectToChannel } from './music-utils';

export const data = new SlashCommandBuilder().setName('stream').setDescription('stream a song in VC').addStringOption(option =>
  option
    .setName('query')
    .setDescription('Provide a song URL')
    .setRequired(true));

export async function execute (interaction: CommandInteraction, client: Client): Promise<void> {
  await interaction.deferReply();
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel as VoiceChannel;
  if (serverQueue.getTextChannel() === undefined) {
    serverQueue.setTextChannel(interaction.channel as TextChannel);
  }
  const url = interaction.options.getString('query');

  console.log(url);
  if (url === null) {
    await interaction.editReply('please provide a url!');
    return;
  }
  if (!ytdl.validateURL(url)) {
    await interaction.editReply('Invalid YouTube url!');
    return;
  }
  const connection = await connectToChannel(voiceChannel);

  const audioPlayerSubscription = connection.subscribe(player);

  if (audioPlayerSubscription === undefined) {
    await interaction.editReply('Unable to subscribe to AudioPlayer, please open a support ticket.');
    return;
  }

  const newSong: Song = {
    url,
    info: await ytdl.getInfo(url),
    requestingUser: interaction.user
  };
  serverQueue.addSongToQueue(newSong);
  interaction.editReply(`Added **${newSong.info.videoDetails.title}** to queue! position in queue: ${serverQueue.getQueuedSongs().length}`).catch(console.error);
  const shouldPlaySongImmediately: boolean = player.state.status === AudioPlayerStatus.Idle && serverQueue.getQueuedSongs().length > 0;
  if (shouldPlaySongImmediately) {
    const nextSong = serverQueue.getFirstSong();
    if (nextSong === undefined) {
      console.log('nextSong is undefined');
      return;
    }
    const resource = getSongResourceByYouTubeUrl(nextSong.url);
    player.play(resource);
  }

  console.log('queued songs:', serverQueue.getQueuedSongs().length);
}
