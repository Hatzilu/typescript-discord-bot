import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with pong');

export async function execute(interaction: CommandInteraction) {
	await interaction.reply(`Pong! latency: ${Math.abs(Date.now() - interaction.createdTimestamp)}`);
}
