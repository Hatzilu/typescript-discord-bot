import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('say')
	.setDescription('make the bot say something')
	.addStringOption((option) => option.setName('text').setDescription('text').setRequired(true));

export async function execute(interaction: CommandInteraction): Promise<void> {
	const text = interaction.options.data?.[0]?.value?.toString() ?? 'text';
	await interaction.deferReply();
	await interaction.channel?.send(text);
	await interaction.deleteReply();
}
