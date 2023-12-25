import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder()
	.setName('skip')
	.setDescription('skip current song or X amount of songs in the queue ');

export async function execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
	await interaction.deferReply();
	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.editReply('Something went wrong while skipping the song');

		return;
	}

	const queue = client.distube?.getQueue(guildId);

	if (!queue?.songs?.length) {
		await interaction.editReply('There are no songs to skip.');

		return;
	}

	if (queue.songs.length === 1) {
		return await client.distube
			?.skip(interaction.guild?.id)
			.then(() => interaction.editReply(`No more songs to skip, the queue has been cleared.`));
	}

	return await client.distube
		?.skip(interaction.guild?.id)
		.then(() => interaction.editReply(`Skipping song...`));
}
