import { SlashCommandBuilder, CommandInteraction, TextChannel } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { player, serverQueue } from './music-utils';

export const data = new SlashCommandBuilder().setName('pause').setDescription('pause current song');

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	if (serverQueue.getTextChannel() === undefined) {
		serverQueue.setTextChannel(interaction.channel as TextChannel);
	}

	if (player.state.status === AudioPlayerStatus.Paused) {
		await interaction.editReply("I'm already paused!");

		return;
	}

	player.pause();
	await interaction.editReply('Paused the music.');
}
