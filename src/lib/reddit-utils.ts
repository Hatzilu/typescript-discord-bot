import { EmbedBuilder, HexColorString } from 'discord.js';
import { RedditPost, RedditResponse, RedditResponseError } from 'src/types/reddit.types';

export function getRandomPost(posts: RedditPost[]) {
	const index = Math.ceil(Math.random() * posts.length);
	const post = posts[index];

	// Remove the item from cache
	posts.splice(index, 1);

	return post as RedditPost;
}

export function getRedditPostEmbed(randomPost: RedditPost) {
	console.log({ randomPost });

	const backgroundColor = !randomPost.data.link_flair_background_color
		? '#0099FF'
		: randomPost.data.link_flair_background_color.startsWith('#')
		? (randomPost.data.link_flair_background_color as HexColorString)
		: (`#${randomPost.data.link_flair_background_color}` as HexColorString);

	const embed = new EmbedBuilder()
		.setColor(backgroundColor)
		.setTitle(randomPost.data.title)
		.setURL('https://www.reddit.com' + randomPost.data.permalink)
		.setThumbnail(randomPost.data.thumbnail)
		.addFields([
			{ name: 'Upvotes', value: randomPost.data.ups.toString() || '0', inline: true },
			{ name: 'Submitted by', value: randomPost.data.author || 'unknown' },
		])
		.setTimestamp(randomPost.data.created * 1000);

	if (randomPost.data.url) {
		embed.setImage(randomPost.data.url);
	}

	return embed.toJSON();
}

const RedditResponseErrorMap = {
	404: 'Subreddit not found, please double check the name of the subreddit you entered.',
	403: 'I cannot access this subreddit, It might be set to private.',
};

export function buildRedditErrorEmbed(errorResponse: RedditResponseError) {
	const backgroundColor = '#FF0000';

	const errorMapKey = errorResponse.error as keyof typeof RedditResponseErrorMap;

	console.log({ errorResponse });

	const embed = new EmbedBuilder()
		.setColor(backgroundColor)
		.setTitle('Oops, something went wrong!')
		.setImage('https://media.tenor.com/p4sZ_qULw70AAAAC/mlp-pinkie-pie.gif')
		.addFields([
			{
				name: 'Error',
				value:
					RedditResponseErrorMap[errorMapKey] ||
					'Something went wrong while retrieving the post, sorry!',
				inline: true,
			},
			{ name: 'Error code', value: errorResponse.error.toString() || 'N/A' },
		]);

	return embed.toJSON();
}

export async function getPostsFromAPIorCache(postCache: Map<string, RedditPost[]>, subreddit: string) {
	if (postCache.get(subreddit)?.length) {
		return postCache.get(subreddit);
	}

	const response = await fetch(
		`https://www.reddit.com/r/${subreddit}/top.json?sort=top&t=all&limit=100&q=cat`,
	);

	const json = (await response.json()) as RedditResponse | RedditResponseError;

	if ('error' in json) {
		return json as RedditResponseError;
	}

	if (!json.data?.children) {
		console.warn('WARNING: json.data.children is null after fetching from ', subreddit);
		postCache.set(subreddit, []);

		return [];
	}

	console.log({ d: json.data.children });

	postCache.set(subreddit, json.data.children);

	return json.data.children;
}
