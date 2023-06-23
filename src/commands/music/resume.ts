import { SlashCommandBuilder, CommandInteraction, TextChannel } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import audioPlayer from '../../lib/audioPlayer';
import { serverQueue } from '../../lib/music-utils';

export const data = new SlashCommandBuilder().setName('resume').setDescription('resume current song');

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	if (serverQueue.getTextChannel() === undefined) {
		serverQueue.setTextChannel(interaction.channel as TextChannel);
	}

	if (audioPlayer.state.status === AudioPlayerStatus.Playing) {
		await interaction.editReply("I'm already playing!");

		return;
	}

	audioPlayer.unpause();
	await interaction.editReply('Resumed playing music.');
}
