import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { distube } from '../../bot';

export const data = new SlashCommandBuilder()
	.setName('skip')
	.setDescription('skip current song or X amount of songs in the queue ');

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();
	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.reply('Something went wrong while skipping the song');

		return;
	}

	return await distube
		.skip(interaction.guild?.id)
		.then((song) => interaction.editReply(`Now Playing: **${song.name}**`));
}
