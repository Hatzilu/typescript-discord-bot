export type RedditResponse = {
	kind: string;
	data: {
		after: string;
		dist: number;
		modhash: string;
		geo_filter: string;
		children: RedditPost[];
		before: any;
	};
};

export type RedditPost = {
	kind: string;
	data: {
		title: string;
		author: string;
		downs: number;
		ups: number;
		url: string;
		permalink: string;
		is_video: boolean;
		link_flair_background_color: string;
		created: number;
	};
};
