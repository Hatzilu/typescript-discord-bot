import { SlashCommandBuilder, CommandInteraction, AttachmentBuilder } from 'discord.js';
import Jimp from 'jimp';
import { getLastChannelAttachment } from '../../lib/image-utils';

export const data = new SlashCommandBuilder()
	.setName('fisheye')
	.setDescription('Add a fisheye effect to the most recently posted image');

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();

	const imageUrl = await getLastChannelAttachment(interaction);

	if (!imageUrl) {
		await interaction.editReply('Could not resolve image URL.');

		return;
	}

	console.log({ imageUrl });

	const image = await Jimp.read(imageUrl);

	// @ts-expect-error function fisheye does not exist on image type
	image.fisheye();

	const mimeType = image.getMIME();
	const buf = await image.getBufferAsync(mimeType);

	const imageAttachment = new AttachmentBuilder(buf, { name: 'fisheye.png', description: 'fisheye' });

	await interaction.editReply({ files: [imageAttachment] });
}
