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
	console.log(randomPost);

	const backgroundColor = !randomPost.data.link_flair_background_color
		? '#0099FF'
		: randomPost.data.link_flair_background_color.startsWith('#')
		? (randomPost.data.link_flair_background_color as HexColorString)
		: (`#${randomPost.data.link_flair_background_color}` as HexColorString);

	const embed = new EmbedBuilder()
		.setColor(backgroundColor)
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

export async function getPostsFromAPIorCache(postCache: Map<string, RedditPost[]>, subreddit: string) {
	if (postCache.get(subreddit)?.length) {
		return postCache.get(subreddit);
	}

	const response: any = await fetch(
		`https://www.reddit.com/r/${subreddit}/top.json?sort=top&t=all&limit=100&q=cat&nsfw=1&include_over_18=on`,
	);

	const json = (await response.json()) as RedditResponse;

	console.log({ d: json.data.children });

	postCache.set(subreddit, json.data.children);

	return json.data.children;
}
