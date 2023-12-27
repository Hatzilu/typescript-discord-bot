import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder().setName('clear').setDescription('clear all queued songs');

export async function execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
	const queue = client.distube?.getQueue(interaction.guild?.id as string);

	if (!queue) {
		await interaction.reply('There are no songs in the queue!').catch(console.error);

		return;
	}

	if (queue?.songs?.length === 0) {
		await interaction.reply('There are no songs in the queue!').catch(console.error);

		return;
	}

	queue.songs.splice(1, queue.songs.length);
	await interaction.reply('💥 Queue has been cleared.').catch(console.error);
}
