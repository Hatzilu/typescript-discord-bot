import { REST } from '@discordjs/rest';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { config } from './config';
import * as commandModules from './commands';
import { Command } from './types';

const commands: SlashCommandBuilder[] = [];

Object.values<Command>(commandModules).forEach((module) => commands.push(module.data));

const rest = new REST({ version: '9' }).setToken(config.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), { body: commands })
	.then(() => {
		console.log('Successfully registered application commands!');
	})
	.catch(console.error);
