import ytdl from 'ytdl-core';
import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayerStatus } from '@discordjs/voice';
import { Client, CommandInteraction, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import { Song } from '../../types';
import { getSongResourceByYouTubeUrl } from '../../utils';
import { serverQueue, player, connectToChannel } from './music-utils';
import { config } from '../../config';
import fetch from 'node-fetch';

const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?key=${config.YOUTUBE_API_KEY}&type=video&q={QUERY}`;

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
  let queryUrlOrString = interaction.options.getString('query');
  if (queryUrlOrString === null) {
    await interaction.editReply('please provide a url!');
    return;
  }
  const queryIsKeywords = !ytdl.validateURL(queryUrlOrString) && typeof queryUrlOrString === 'string';
  if (queryIsKeywords) {
    const apiUrlWithQuery = youtubeApiUrl.replace('{QUERY}', queryUrlOrString);
    const res = await fetch(apiUrlWithQuery);
    const queryResults = await res.json() as youtubeResponse;
    if (queryResults.items.length === 0) {
      await interaction.editReply('something went wrong while fetching the query results!');
      return;
    }
    if (queryResults.items[0].id.videoId === null) {
      await interaction.editReply(`invalid query result! ${JSON.stringify(queryResults)}`);
      return;
    }
    queryUrlOrString = `https://www.youtube.com/watch?v=${queryResults.items[0].id.videoId}`;
  }
  const connection = await connectToChannel(voiceChannel);

  const audioPlayerSubscription = connection.subscribe(player);

  if (audioPlayerSubscription === undefined) {
    await interaction.editReply('Unable to subscribe to AudioPlayer, please open a support ticket.');
    return;
  }

  const newSong: Song = {
    url: queryUrlOrString,
    info: await ytdl.getInfo(queryUrlOrString),
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

interface youtubeResponse {
  kind: string
  etag: string
  nextPageToken: string
  regionCode: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: youtubeResponseItem[]
}

interface youtubeResponseItem {
  kind: string
  etag: string
  id: {
    kind: string
    videoId: string
  }
}
