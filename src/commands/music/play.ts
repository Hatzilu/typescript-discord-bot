import { SlashCommandBuilder, CommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { normalizeSpotifyLocalizationLinks } from '../../lib/music-utils';
import { distube } from '../../bot';

export const data = new SlashCommandBuilder()
	.setName('play')
	.setDescription('play a song in VC')
	.addStringOption((option) =>
		option.setName('query').setDescription('Provide a song URL').setRequired(true),
	);

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();
	const member = interaction.member as GuildMember;
	const voiceChannel = member.voice.channel as VoiceChannel;

	let queryUrlOrString = interaction.options.data[0]?.value?.toString() || '';

	if (queryUrlOrString === null) {
		await interaction.editReply('please provide a url!');

		return;
	}

	queryUrlOrString = normalizeSpotifyLocalizationLinks(queryUrlOrString);

	distube.play(voiceChannel, queryUrlOrString, {
		message: await interaction.editReply(`**Now Playing:** ${queryUrlOrString}`),
		member: member,
	});
}
