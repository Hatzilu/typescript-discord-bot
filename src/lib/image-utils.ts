import { ChannelType, ChatInputCommandInteraction } from 'discord.js';

export const getLastChannelAttachment = async (interaction: ChatInputCommandInteraction) => {
	if (interaction.channel?.type !== ChannelType.GuildText) {
		throw new Error(
			'Invalid channel type passed to getLastChannelAttachment, expected TextChannel, got ' +
				interaction.channel?.type,
		);
	}

	const messages = await interaction.channel.messages.fetch({ limit: 100 });
	const sortedMessages = messages?.sort((a, b) => b.createdTimestamp - a.createdTimestamp);

	if (!sortedMessages) {
		await interaction.editReply('Could not find any images to edit.');

		return;
	}

	const lastMessageWithAttachment = sortedMessages.filter((m) => m.attachments.size > 0).first();

	if (!lastMessageWithAttachment) {
		await interaction.editReply('Could not resolve last sent attachment.');

		return;
	}

	const imageUrl = lastMessageWithAttachment.attachments.at(0)?.url;

	return imageUrl;
};
