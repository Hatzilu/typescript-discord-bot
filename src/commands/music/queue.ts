import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { serverQueue } from './music-utils';

export const data = new SlashCommandBuilder().setName('queue').setDescription('display all queued songs');

export function execute (interaction: CommandInteraction): void {
  if (serverQueue.getQueuedSongs().length === 0) {
    interaction.reply('There are no songs in the queue!').catch(console.error);
    return;
  }
  const songListString: string[] =
    serverQueue.getQueuedSongs().map((song, index) => `[${index + 1}]: ${song.info.videoDetails.title} requested by [${song.requestingUser.username}]`);

  const codeBlockFormattedString: string = '```ini\n' + `${songListString.join('\r\n')}` + '```';
  interaction.reply(codeBlockFormattedString).catch(console.error);
}
