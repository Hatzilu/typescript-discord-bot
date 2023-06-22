import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder().setName('greet').setDescription('Holiday-appropriate greeting');

export async function execute(interaction: CommandInteraction): Promise<void> {
	const hebrewText: string = 'ראש השנה שמח';
	return await interaction.reply(`${interaction.user.toString()}, ${hebrewText}`);
}
