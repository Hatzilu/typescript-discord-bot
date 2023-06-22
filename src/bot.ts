import { Client, Partials } from 'discord.js';
import { config, BOT_INTENTS } from './config';
import * as commandModules from './commands';

const commands = new Object(commandModules);

const client = new Client({
	intents: BOT_INTENTS,
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once('ready', () => {
	console.log('Canni is up ^^');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) {
		return;
	}

	const user = await interaction.guild?.members.fetch(interaction.user.id);

	console.log(`${interaction.user.username} used a command: ${interaction.toString()}`);

	if (user?.nickname === 'Dorsan') {
		await interaction.reply('אתה מכוער');
	}

	const { commandName } = interaction;

	if (commandName in commands) {
		// @ts-expect-error execute does not exist
		commands[commandName as keyof typeof commands].execute(interaction, client);

		return;
	}
});

client.login(config.DISCORD_TOKEN).catch(console.error);

export default client;
