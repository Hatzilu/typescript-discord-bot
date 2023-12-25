import {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	MappedInteractionTypes,
	ComponentType,
	MessageActionRowComponentBuilder,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Song } from 'distube';
import { CustomClient } from '../../types';

export const data = new SlashCommandBuilder().setName('queue').setDescription('display all queued songs');

const buildQueueEmbed = (songs: Song<unknown>[], page: number) => {
	const startIndex = page * 10;
	const songsToShow = songs.slice(startIndex, startIndex + 10);

	const totalPages = Math.ceil(songs.length / 10);
	const currentPage = page + 1;

	const embed = new EmbedBuilder()
		.setDescription(`**Page** \`${currentPage}\`**/**\`${totalPages}\``)
		.setFooter({ text: `${songs.length} song${songs.length > 1 ? 's' : ''} in queue` });

	songsToShow.forEach((song, i) => {
		const index = page === 0 ? (i + 1) * 1 : i + 1 + page * 10;

		embed.addFields({
			name: `\u200B`,
			value: `\`${index}.\` [${song.name}](${song.url})`,
			inline: false,
		});
	});

	return embed;
};

const handleDisplayingQueue = async (
	interaction: ChatInputCommandInteraction,
	songs: Song<unknown>[],
	page: number,
	confirmation?: MappedInteractionTypes<false>[ComponentType.Button],
): Promise<void> => {
	const songListEmbed = buildQueueEmbed(songs, page);
	const totalPages = Math.ceil(songs.length / 10);

	const next = new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary);

	const prev = new ButtonBuilder().setCustomId('back').setLabel('Back').setStyle(ButtonStyle.Primary);

	const row = new ActionRowBuilder<MessageActionRowComponentBuilder>();

	console.log({ page, totalPages, totalSongs: songs.length });

	if (page <= 0) {
		prev.setDisabled(true);
	}

	if (page + 1 >= totalPages) {
		next.setDisabled(true);
	}

	row.addComponents(prev, next);

	let response;

	if (confirmation) {
		response = await confirmation.update({ embeds: [songListEmbed], components: [row] });
	} else {
		response = await interaction
			.editReply({
				embeds: [songListEmbed],
				components: [row],
			})
			.catch(console.error);
	}

	try {
		const newConfirmation = await response?.awaitMessageComponent({
			filter: (i) => i.user.id === interaction.user.id,
			time: 30000,
			componentType: ComponentType.Button,
		});

		if (!newConfirmation) {
			await interaction
				.editReply('Something went wrong while resolving button interaction')
				.catch(console.error);

			return;
		}

		if (newConfirmation.customId === 'next') {
			page += 1;

			if (page > totalPages) {
				page = totalPages;
			}

			return handleDisplayingQueue(interaction, songs, page, newConfirmation);
		} else if (newConfirmation.customId === 'prev') {
			page -= 1;

			if (page < 0) {
				page = 0;
			}

			return handleDisplayingQueue(interaction, songs, page, newConfirmation);
		}
	} catch (error) {}
};

export async function execute(interaction: ChatInputCommandInteraction, client: CustomClient) {
	const page = 0;

	await interaction.deferReply();
	const queue = client.distube?.getQueue(interaction.guild?.id as string);

	if (!queue) {
		await interaction.editReply('There are no songs in the queue!').catch(console.error);

		return;
	}

	if (queue?.songs?.length === 0) {
		await interaction.editReply('There are no songs in the queue!').catch(console.error);

		return;
	}

	handleDisplayingQueue(interaction, queue.songs, page);
}
