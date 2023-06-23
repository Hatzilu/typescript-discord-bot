import { SlashCommandBuilder, CommandInteraction, TextChannel } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import audioPlayer from '../../lib/audioPlayer';
import { getCurrentlyPlayingSong, serverQueue } from '../../lib/music-utils';

export const data = new SlashCommandBuilder().setName('lyrics').setDescription('lyrics for the current song');

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	if (serverQueue.getTextChannel() === undefined) {
		serverQueue.setTextChannel(interaction.channel as TextChannel);
	}

	if (audioPlayer.state.status !== AudioPlayerStatus.Playing) {
		await interaction.editReply('There is no song currently playing.');

		return;
	}

	const resource = getCurrentlyPlayingSong(audioPlayer);

	if (!resource) {
		await interaction.editReply("Sorry, i couldn't fetch the currently playing song, go fuck urself lol");

		return;
	}

	const url = `https://api.musixmatch.com/ws/1.1/track.search?apikey=${
		process.env['MUSIXMATCH_API_KEY'] ?? ''
	}&q=${resource.metadata.title || ''}`;

	console.log({ URL: url, resource });

	const trackRes = await fetch(url);

	const trackJson = await trackRes.json();

	console.log(trackJson);

	await interaction.editReply(`\`\`\`json\n${JSON.stringify(trackJson, null, 2)}\`\`\``);

	// Resource.metadata.title;
}
