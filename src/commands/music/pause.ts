import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder().setName('pause').setDescription('pause current song');

export async function execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
	await interaction.deferReply();

	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.editReply('Something went wrong while pausing the song');

		return;
	}

	client.distube?.pause(guildId);
	await interaction.editReply('Paused the music.');
}
