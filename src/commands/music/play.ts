import { SlashCommandBuilder, CommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import { normalizeSpotifyLocalizationLinks } from '../../lib/music-utils';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder()
	.setName('play')
	.setDescription('play a song in VC')
	.addStringOption((option) =>
		option.setName('query').setDescription('Provide a song URL').setRequired(true),
	);

export async function execute(interaction: CommandInteraction, client: CustomClient) {
	await interaction.deferReply();
	const member = interaction.member as GuildMember;
	const voiceChannel = member.voice.channel as VoiceChannel;
	const guildId = interaction.guild?.id;

	if (!guildId) {
		await interaction.editReply('Something went wrong, please try again later.');

		return;
	}

	let queryUrlOrString = interaction.options.data[0]?.value?.toString() || '';

	if (queryUrlOrString === null) {
		await interaction.editReply('please provide a url!');

		return;
	}

	queryUrlOrString = normalizeSpotifyLocalizationLinks(queryUrlOrString);

	client.distube?.play(voiceChannel, queryUrlOrString, { member }).then(() => {
		const songs = client.distube?.getQueue(guildId)?.songs;

		if (!songs?.length) {
			return;
		}

		const lastSong = songs[songs.length - 1];

		if (!lastSong) {
			return;
		}

		if (songs.length > 1) {
			interaction.editReply(
				`Adding **${lastSong.name}** to the queue, position in queue: ${songs.length} requested by ${lastSong.user?.username}`,
			);

			return;
		}

		interaction.editReply(`Now Playing: **${lastSong.name}** by ${lastSong.user?.username || 'unknown'}`);
	});
}
