import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	GuildMember,
	VoiceChannel,
	TextChannel,
} from 'discord.js';
import { normalizeSpotifyLocalizationLinks } from '../../lib/music-utils';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder()
	.setName('play')
	.setDescription('play a song in VC')
	.addStringOption((option) =>
		option.setName('query').setDescription('Provide a song URL').setRequired(true),
	);

export async function execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
	await interaction.deferReply();
	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.editReply('Something went wrong, please try again later.');

		return;
	}

	const member = interaction.member as GuildMember;
	const voiceChannel = member.voice.channel as VoiceChannel;

	if (!voiceChannel) {
		await interaction.editReply('You must be in a voice channel to play music!');

		return;
	}

	const textChannel = interaction.channel as TextChannel;

	let queryUrlOrString = interaction.options.getString('query', true);

	queryUrlOrString = normalizeSpotifyLocalizationLinks(queryUrlOrString);

	client.distube?.play(voiceChannel, queryUrlOrString, { member, textChannel });
	await interaction.editReply(`🔎 \`Searching for "${queryUrlOrString}"...\``);
}
