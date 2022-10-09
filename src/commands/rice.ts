import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, CommandInteraction, HexColorString, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export const data = new SlashCommandBuilder()
  .setName('rice')
  .setDescription('Random riced linux desktop from the r/unixporn subreddit');

export async function execute (interaction: CommandInteraction, client: Client): Promise<void> {
  await interaction.deferReply();
  const response: any = await fetch('https://www.reddit.com/r/unixporn/top.json?sort=top&t=all&limit=100&q=cat&nsfw=1&include_over_18=on');
  const json = (await response.json() as RedditResponse);
  if (json.data.children.length === 0) {
    interaction.editReply('sorry, something went wrong...').catch(console.error);
    return;
  }
  let randomPost: RedditPost = getRandomPost(json);
  while (randomPost.data.is_video ?? !randomPost.data.url.endsWith('png') ?? !randomPost.data.url.endsWith('jpg')) {
    randomPost = getRandomPost(json);
  }
  try {
    const redditPostEmbed = getRedditPostEmbed(randomPost);
    console.log(randomPost);
    interaction.editReply({ embeds: [redditPostEmbed] }).catch(console.error);
  } catch (err: unknown) {
    if (err instanceof Error) {
      interaction.editReply(err.message).catch(console.error);
    }
    console.log(err);
  }
}

function getRandomPost (json: RedditResponse): RedditPost {
  return json?.data?.children[Math.ceil(Math.random() * json?.data?.children?.length)];
}

function getRedditPostEmbed (randomPost: RedditPost): MessageEmbed {
  return new MessageEmbed()
    .setColor(randomPost.data.link_flair_background_color as HexColorString ?? 0x0099FF)
    .setTitle(randomPost.data.title)
    .setURL('https://www.reddit.com' + randomPost.data.permalink)
    .addField(
      'Upvotes', randomPost.data.ups.toString(), true
    )
    .addField(
      'Submitted by', randomPost.data.author
    )
    .setImage(randomPost.data.url)
    .setTimestamp(randomPost.data.created * 1000);
}
interface RedditResponse {

  kind: string
  data: {
    after: string
    dist: number
    modhash: string
    geo_filter: string
    children: RedditPost[]
    before: any
  }
}

interface RedditPost {
  kind: string
  data: {
    title: string
    author: string
    downs: number
    ups: number
    url: string
    permalink: string
    is_video: boolean
    link_flair_background_color: string
    created: number
  }
}
