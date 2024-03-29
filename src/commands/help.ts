import {
	SlashCommandBuilder,
	Client,
	TextChannel,
	ChannelType,
	ChatInputCommandInteraction,
} from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Help command')
	.addStringOption((option) =>
		option.setName('description').setDescription('Describe your problem').setRequired(true),
	);

export async function execute(interaction: ChatInputCommandInteraction, client: Client): Promise<void> {
	if (interaction.channelId === null ?? interaction.channelId === '') {
		return;
	}

	const channel = await client.channels.fetch(interaction.channelId);

	if (channel === null || channel?.type !== ChannelType.GuildText) {
		return;
	}

	const thread = await (channel as TextChannel).threads.create({
		name: `support-${Date.now()}`,
		reason: `Support Ticket ${Date.now()}`,
	});

	const problemDescription = interaction.options.getString('description', true);

	const { user } = interaction;

	thread.send(`**User:** ${user.toString()} \n**Problem:** ${problemDescription}`).catch(console.error);

	// await createTicket(thread.id, problemDescription);

	await interaction.reply({
		content: 'Help is on the way!',
		ephemeral: true, // ephemeral = only the user sending the request can see this message
	});
}
