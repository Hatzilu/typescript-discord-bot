import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { distube } from '../../bot';

export const data = new SlashCommandBuilder().setName('queue').setDescription('display all queued songs');

export function execute(interaction: CommandInteraction): void {
	const queue = distube.getQueue(interaction.guild?.id as string);

	if (!queue) {
		interaction.reply('There are no songs in the queue!').catch(console.error);

		return;
	}

	if (queue?.songs?.length === 0) {
		interaction.reply('There are no songs in the queue!').catch(console.error);

		return;
	}

	const songListString = queue.songs.map(
		(song, index) => `[${index + 1}]: ${song.name} requested by [${song.user}]`,
	);

	const codeBlockFormattedString: string = '```ini\n' + `${songListString.join('\r\n')}` + '```';

	interaction.reply(codeBlockFormattedString).catch(console.error);
}
