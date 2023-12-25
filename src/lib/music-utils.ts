import { EmbedBuilder } from 'discord.js';
import DisTube from 'distube';
import { config } from '../config';

/**
 * some spotify links have a /intl-{country code}/ part in them that distube hates, so i'm cutting them out
 * if it's not a spotify link, exit early.
 * TODO: remove this function once 'spotify-uri' fixes the error these links cause, and once '@distube/spotify' updates their 'spotify-uri' package.
 */
export const normalizeSpotifyLocalizationLinks = (queryUrlOrString: string) => {
	const spotifyLocalizedUrlRegex = new RegExp(
		/https:\/\/open\.spotify\.com\/intl-(?<countryCode>.+?(?=\/))\//g,
	);

	const result = spotifyLocalizedUrlRegex.exec(queryUrlOrString);

	if (result === null || !result?.groups) {
		return queryUrlOrString;
	}

	const countryCode = result.groups['countryCode'];

	return queryUrlOrString.replace(`/intl-${countryCode}`, '');
};

export const formatDurationInSeconds = (n: number): string => {
	if (n < 0 || isNaN(n)) {
		return 'N/A';
	}

	const hours = Math.floor(n / 3600);
	const minutes = Math.floor((n % 3600) / 60);
	const seconds = Math.floor(n % 60);

	const formattedHours = String(hours).padStart(2, '0');
	const formattedMinutes = String(minutes).padStart(2, '0');
	const formattedSeconds = String(seconds).padStart(2, '0');

	let duration = `${formattedMinutes}:${formattedSeconds}`;

	if (hours > 0) {
		duration = `${formattedHours}:${duration}`;
	}

	return duration;
};

export function formatViews(num: number) {
	const lookup = [
		{ value: 1, symbol: '' },
		{ value: 1e3, symbol: 'k' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e9, symbol: 'G' },
		{ value: 1e12, symbol: 'T' },
		{ value: 1e15, symbol: 'P' },
		{ value: 1e18, symbol: 'E' },
	];

	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

	const item = lookup
		.slice()
		.reverse()
		.find((item) => num >= item.value);

	if (!item) {
		return '0';
	}

	return (num / item.value).toFixed(1).replace(rx, '$1') + item.symbol;
}

/**
 * Set-up the DisTube event callbacks
 * @param {DisTube} distube
 */
export const registerDisTubeEvents = (distube: DisTube) => {
	distube.on('addSong', (queue, song) => {
		console.log('Add song event');
		const songIndex = queue.songs.length;

		const totalSongsDuration = queue.songs.reduce((acc, b, i) => {
			if (i + 1 === queue.songs.length) {
				return acc;
			}

			return acc + b.duration;
		}, 0);

		const embed = new EmbedBuilder()
			.setTitle(song.name || 'Unknown')
			.setURL(song.url)
			.setAuthor({ name: '🎧 Added to the queue!' })
			.addFields([
				{
					name: 'Position in queue',
					value: `#${songIndex}`,
					inline: true,
				},
				{
					name: 'Estimated time until playing',
					value: formatDurationInSeconds(totalSongsDuration),
					inline: true,
				},
			]);

		if (song.thumbnail) {
			embed.setThumbnail(song.thumbnail);
		}

		queue.textChannel?.send({ embeds: [embed] });
	});
	distube.on('addList', (queue, playlist) => {
		console.log('Add list event');

		const firstPlaylistSong = playlist.songs[0];

		if (!firstPlaylistSong) {
			return;
		}

		const songIndex = queue.songs.findIndex((s) => s.id === firstPlaylistSong.id);

		queue.textChannel?.send(
			`🎶 **Queued \`${playlist.songs.length}\` songs from [${playlist.name}](${
				playlist.url
			})** 🎶\n 🕓 **Position in queue: ${songIndex + 1}** \n 🎧 **Requested by: ${playlist.user}**`,
		);
	});

	distube.on('playSong', (queue, song) => {
		const embed = new EmbedBuilder()
			.setTitle(song.name || 'Unknown')
			.setURL(song.url)
			.setAuthor({
				name: '▶️ Now playing 🎶',
			})
			.setImage(config.EMBED_BANNER)
			.addFields([
				{
					name: 'Playback duration',
					value: song.formattedDuration ?? 'N/A',
					inline: true,
				},
				{
					name: 'Source',
					value: song.source ?? 'N/A',
					inline: true,
				},
				{
					name: 'Views',
					value: formatViews(song.views),
					inline: true,
				},
			]);

		if (song.thumbnail) {
			embed.setThumbnail(song.thumbnail);
		}

		if (song.uploader?.name) {
			embed.setDescription(`by [${song.uploader.name}](${song.uploader.url})`);
		}

		queue.textChannel?.send({ embeds: [embed] });
	});
};
