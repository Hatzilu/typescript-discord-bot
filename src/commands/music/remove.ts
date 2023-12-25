import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	GuildMember,
	VoiceChannel,
	TextChannel,
} from 'discord.js';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder()
	.setName('remove')
	.setDescription('remove a song from the music queue.')
	.addNumberOption((option) =>
		option
			.setName('index')
			.setDescription('The song index in the queue')
			.setRequired(true)
			.setMinValue(1),
	);

export async function execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
	await interaction.deferReply();
	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.editReply('❌ Something went wrong, please try again later.');

		return;
	}

	const member = interaction.member as GuildMember;
	const voiceChannel = member.voice.channel as VoiceChannel;

	if (!voiceChannel) {
		await interaction.editReply('❌ You must be in a voice channel to to that!');

		return;
	}

	const textChannel = interaction.channel as TextChannel;
	const queue = client.distube?.getQueue(guildId);

	if (!queue) {
		await interaction.editReply('❌ There are no songs to remove!');

		return;
	}

	const index = interaction.options.getNumber('index', true);
	const actuaIndex = index - 1;

	const songToRemove = queue.songs[actuaIndex];

	if (!songToRemove) {
		await interaction.editReply(`❌ There is no song in position #${index}!`);

		return;
	}

	queue.songs.splice(actuaIndex, 1);

	await interaction.editReply(`✂️ Removed \`${songToRemove.name}\` from the queue.`);
}
