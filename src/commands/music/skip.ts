import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	GuildMember,
	TextChannel,
	VoiceChannel,
} from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import audioPlayer from '../../lib/audioPlayer';
import { connectToChannel, playSong, serverQueue } from '../../lib/music-utils';

export const data = new SlashCommandBuilder()
	.setName('skip')
	.setDescription('skip current song or X amount of songs in the queue ')
	.addNumberOption((option) =>
		option.setName('amount').setDescription('How many songs to skip in the queue'),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply();
	const member = interaction.member as GuildMember;
	const voiceChannel = member.voice.channel as VoiceChannel;

	let numberOfSongs = Number(interaction.options.data[0]?.value?.toString()) || 1;

	if (serverQueue.getTextChannel() === undefined) {
		serverQueue.setTextChannel(interaction.channel as TextChannel);
	}

	if (serverQueue.getQueuedSongs().length === 0 && audioPlayer.state.status !== AudioPlayerStatus.Playing) {
		await interaction.editReply('There are no songs to skip!');

		return;
	}

	if (numberOfSongs > serverQueue.getQueuedSongs().length) {
		numberOfSongs = 1;
	}

	// Handle cases where the user skips multiple songs
	if (numberOfSongs > 1) {
		console.log({ numberOfSongs });

		for (let i = 0; i < numberOfSongs; i++) {
			if (serverQueue.getQueuedSongs().length < 1) {
				return;
			}

			const song = serverQueue.getNextSong();

			console.log('skipping the song ', song?.info?.videoDetails?.title || song?.url || '');
			console.log('i=', i);
		}
	}

	const nextSong = serverQueue.getQueuedSongs()[0];

	const connection = await connectToChannel(voiceChannel);

	const audioPlayerSubscription = connection.subscribe(audioPlayer);

	if (audioPlayerSubscription === undefined) {
		await interaction.editReply('Unable to subscribe to AudioPlayer, please open a support ticket.');

		return;
	}

	if (!nextSong) {
		audioPlayer.stop();

		await interaction.editReply('No more songs in queue, I will stop playing music.');

		return;
	}

	playSong(nextSong, audioPlayer);

	console.log(`Skipping ${numberOfSongs} song(s)`);

	if (numberOfSongs > 1) {
		await interaction.editReply(`Skipping ${numberOfSongs} songs...`);
	} else {
		await interaction.editReply(`Skipping current song...`);
	}
}
