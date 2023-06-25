import { EmbedBuilder, HexColorString } from 'discord.js';
import { RedditPost, RedditResponse } from 'src/types/reddit.types';

export function getRandomPost(posts: RedditPost[]) {
	const index = Math.ceil(Math.random() * posts.length);
	const post = posts[index];

	// Remove the item from cache
	posts.splice(index, 1);

	return post as RedditPost;
}

export function getRedditPostEmbed(randomPost: RedditPost) {
	const embed = new EmbedBuilder()
		.setColor(
			(randomPost.data.link_flair_background_color as HexColorString)
				? `#${randomPost.data.link_flair_background_color}`
				: 0x0099ff,
		)
		.setTitle(randomPost.data.title)
		.setURL('https://www.reddit.com' + randomPost.data.permalink)
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

export async function getPostsFromAPIorCache(
	postCache: RedditPost[],
	subreddit: string,
): Promise<RedditPost[]> {
	if (postCache.length > 0) {
		return postCache;
	}

	const response: any = await fetch(
		`https://www.reddit.com/r/${subreddit}/top.json?sort=top&t=all&limit=100&q=cat&nsfw=1&include_over_18=on`,
	);

	const json = (await response.json()) as RedditResponse;

	console.log({ d: json.data.children });

	postCache.push(...json.data.children);

	return json.data.children;
}
