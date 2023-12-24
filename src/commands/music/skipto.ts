import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder()
	.setName('skipto')
	.setDescription('skip to a specific song in the queue')
	.addNumberOption((opt) =>
		opt.setName('index').setDescription('The bot will skip to this song in the queue'),
	);

export async function execute(interaction: CommandInteraction, client: CustomClient) {
	await interaction.deferReply();
	const guildId = interaction.guild?.id;

	const index = interaction.options.get('index')?.value;

	if (!guildId || typeof index !== 'number') {
		await interaction.reply('Something went wrong while skipping the song');

		return;
	}

	const queue = client.distube?.getQueue(guildId);

	if (!queue?.songs?.length) {
		await interaction.reply('There are no songs to skip to!');

		return;
	}

	if (!queue.songs[index - 1]) {
		await interaction.reply('There is no song in that position!');

		return;
	}

	return await client.distube
		?.jump(guildId, index)
		.then((song) => interaction.editReply(`Now Playing: **${song.name}**`));
}
