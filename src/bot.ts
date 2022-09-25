import { Client } from "discord.js";
import {config, BOT_INTENTS } from "./config";

export const client = new Client({intents: BOT_INTENTS})

client.once('ready', () => {
    console.log('Canni is up ^^')
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const {commandName} = interaction;
    switch(commandName) {
        case 'ping': 
        return interaction.reply('pong')
    }
})

client.login(config.DISCORD_TOKEN)