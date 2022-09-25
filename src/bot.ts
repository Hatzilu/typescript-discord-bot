import { Client } from "discord.js";
import {config, BOT_INTENTS } from "./config";
import * as commandModules from './commands';

const commands = Object(commandModules)


export const client = new Client({intents: BOT_INTENTS})

client.once('ready', () => {
    console.log('Canni is up ^^')
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const {commandName} = interaction;
    commands[commandName].execute(interaction, client);
})

client.login(config.DISCORD_TOKEN)