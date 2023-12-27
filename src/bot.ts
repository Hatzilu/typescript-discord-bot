import { Client, Partials } from 'discord.js';
import DisTube from 'distube';
import SpotifyPlugin from '@distube/spotify';
import { config, BOT_INTENTS } from './config';
import * as commandModules from './commands';
import { initializeMongoDB } from './mongodb';
import { CustomClient } from './types';
import { registerDisTubeEvents } from './lib/music-utils';

const commands = new Object(commandModules);

initializeMongoDB();

const client: CustomClient = new Client({
	intents: BOT_INTENTS,
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.distube = new DisTube(client, {
	leaveOnStop: false,
	emitNewSongOnly: true,
	emitAddSongWhenCreatingQueue: false,
	emitAddListWhenCreatingQueue: true,
	plugins: [
		new SpotifyPlugin({
			emitEventsAfterFetching: true,
		}),
	],
});

client.once('ready', () => {
	console.log('Canni is up ^^');

	if (client.distube) {
		registerDisTubeEvents(client.distube);
		console.log('DisTube events successfully registered!');
	}
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
