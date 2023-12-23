import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { distube } from '../../bot';

export const data = new SlashCommandBuilder().setName('resume').setDescription('resume current song');

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();
	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.editReply('Something went wrong while resuming the song');

		return;
	}

	distube.resume(guildId);
	await interaction.editReply('Resumed playing music.');
}
