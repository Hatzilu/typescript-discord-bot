import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import {
	buildRedditErrorEmbed,
	getPostsFromAPIorCache,
	getRandomPost,
	getRedditPostEmbed,
	isRedditPostInvalid,
} from '../lib/reddit-utils';
import { RedditPost } from '../types/reddit.types';

export const data = new SlashCommandBuilder()
	.setName('reddit')
	.setDescription('Random reddit post from a given subreddit')
	.addStringOption((option) =>
		option.setName('subreddit').setDescription('the subreddit to fetch from').setRequired(true),
	);

const postCache = new Map<string, RedditPost[]>();

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	const subreddit = interaction.options.data[0]?.value?.toString() || '';

	console.log({ subreddit });

	const posts = await getPostsFromAPIorCache(postCache, subreddit);

	console.log({ posts });

	if (!posts) {
		interaction.editReply('sorry, something went wrong...').catch(console.error);

		return;
	}

	if ('error' in posts) {
		const errorEmbed = buildRedditErrorEmbed(posts);

		interaction.editReply({ embeds: [errorEmbed] }).catch(console.error);

		return;
	}

	if (!posts || posts.length === 0) {
		interaction.editReply('sorry, something went wrong...').catch(console.error);

		return;
	}

	let randomPost = getRandomPost(posts);

	while (isRedditPostInvalid(randomPost)) {
		randomPost = getRandomPost(posts);
	}

	try {
		const redditPostEmbed = getRedditPostEmbed(randomPost);

		await interaction.editReply({ embeds: [redditPostEmbed] });
	} catch (error: unknown) {
		if (error instanceof Error) {
			await interaction.editReply(
				`failed to create embed!! \n \`\`\`${JSON.stringify(error, null, 2)}\`\`\``,
			);
		}

		console.error(`failed to create embed!!`, error);
	}
}
