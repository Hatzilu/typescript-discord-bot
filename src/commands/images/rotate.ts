import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import Jimp from 'jimp';
import { getLastChannelAttachment } from '../../lib/image-utils';

export const data = new SlashCommandBuilder()
	.setName('rotate')
	.setDescription('Rotate the most recently posted image')
	.addNumberOption((option) =>
		option.setName('degrees').setDescription('How many degrees to rotate, Default is 90.'),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply();

	const imageUrl = await getLastChannelAttachment(interaction);

	const degrees = (interaction.options?.data[0]?.value ?? 90) as number;

	if (!imageUrl) {
		await interaction.editReply('Could not resolve image URL.');

		return;
	}

	console.log({ imageUrl });

	const image = await Jimp.read(imageUrl);

	image.rotate(degrees, false);

	const mimeType = image.getMIME();
	const buf = await image.getBufferAsync(mimeType);

	const imageAttachment = new AttachmentBuilder(buf, { name: 'rotate.png', description: 'rotate' });

	await interaction.editReply({ files: [imageAttachment] });
}
