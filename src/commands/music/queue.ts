import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder().setName('queue').setDescription('display all queued songs');

export function execute(interaction: CommandInteraction, client: CustomClient): void {
	const queue = client.distube?.getQueue(interaction.guild?.id as string);

	if (!queue) {
		interaction.reply('There are no songs in the queue!').catch(console.error);

		return;
	}

	if (queue?.songs?.length === 0) {
		interaction.reply('There are no songs in the queue!').catch(console.error);

		return;
	}

	const songListString = queue.songs.map(
		(song, index) => `[${index + 1}]: ${song.name} requested by [${song.user?.username}]`,
	);

	const codeBlockFormattedString: string = '```ini\n' + `${songListString.join('\r\n')}` + '```';

	interaction.reply(codeBlockFormattedString).catch(console.error);
}
