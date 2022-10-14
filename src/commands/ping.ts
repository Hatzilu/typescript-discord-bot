import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with pong');

export async function execute (interaction: CommandInteraction): Promise<void> {
  return await interaction.reply(`Pong! latency: ${Date.now() - interaction.createdTimestamp} ms`);
}
