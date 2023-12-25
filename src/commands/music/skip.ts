import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder()
	.setName('skip')
	.setDescription('skip current song or X amount of songs in the queue ');

export async function execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.reply('Something went wrong while skipping the song');

		return;
	}

	const queue = client.distube?.getQueue(guildId);

	if (!queue?.songs?.length) {
		await interaction.reply('There are no songs to skip.');

		return;
	}

	if (queue.songs.length === 1) {
		await client.distube?.skip(interaction.guild?.id);

		await interaction.reply(`No more songs to skip, the queue has been cleared.`);

		return;
	}

	return await client.distube
		?.skip(interaction.guild?.id)
		.then(() => interaction.editReply(`Skipping song...`));
}
