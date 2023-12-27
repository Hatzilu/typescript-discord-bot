import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder().setName('resume').setDescription('resume current song');

export async function execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
	await interaction.deferReply();
	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.editReply('Something went wrong while resuming the song');

		return;
	}

	client.distube?.resume(guildId);
	await interaction.editReply('Resumed playing music.');
}
