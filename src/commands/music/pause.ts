import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { distube } from '../../bot';

export const data = new SlashCommandBuilder().setName('pause').setDescription('pause current song');

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.editReply('Something went wrong while pausing the song');

		return;
	}

	distube.pause(guildId);
	await interaction.editReply('Paused the music.');
}
