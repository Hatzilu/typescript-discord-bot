import { SlashCommandBuilder, CommandInteraction, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import { connectToChannel, getSongResourceBySongObject, player, serverQueue } from './music-utils';

export const data = new SlashCommandBuilder()
	.setName('skip')
	.setDescription('skip current song or X amount of songs in the queue ')
	.addNumberOption((option) =>
		option.setName('amount').setDescription('How many songs to skip in the queue'),
	);

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();
	const member = interaction.member as GuildMember;
	const voiceChannel = member.voice.channel as VoiceChannel;

	console.log(interaction.options.data);

	let numberOfSongs = Number(interaction.options.data[0]?.value?.toString()) || 1;

	if (serverQueue.getTextChannel() === undefined) {
		serverQueue.setTextChannel(interaction.channel as TextChannel);
	}

	if (serverQueue.getQueuedSongs().length === 0) {
		await interaction.editReply('There are no songs to skip!');

		return;
	}

	if (numberOfSongs > serverQueue.getQueuedSongs().length) {
		numberOfSongs = 1;
	}

	if (numberOfSongs > 1) {
		console.log({ numberOfSongs });

		for (let i = 0; i < numberOfSongs || serverQueue.getQueuedSongs().length < 2; i++) {
			const song = serverQueue.getNextSong();

			console.log('skipping the song ', song?.info?.videoDetails?.title || song?.url || '');
			console.log('i=', i);
		}
	}

	const nextSong = serverQueue.getQueuedSongs()[0] || '';

	if (!nextSong) {
		await interaction.editReply('There are no songs to skip!');

		return;
	}

	const connection = await connectToChannel(voiceChannel);

	const audioPlayerSubscription = connection.subscribe(player);

	if (audioPlayerSubscription === undefined) {
		await interaction.editReply('Unable to subscribe to AudioPlayer, please open a support ticket.');

		return;
	}

	const audioResource = getSongResourceBySongObject(nextSong);

	player.play(audioResource);

	if (numberOfSongs > 1) {
		await interaction.editReply(`Skipping ${numberOfSongs} songs...`);
	} else {
		await interaction.editReply(`Skipping current song...`);
	}
}
