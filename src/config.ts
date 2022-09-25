import dotenv from 'dotenv';
import {BitFieldResolvable, IntentsString} from 'discord.js'
dotenv.config()

const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env

if (!CLIENT_ID || !GUILD_ID || !DISCORD_TOKEN) {
    throw new Error('Missing environment variables')
}

export const config: Record<string, string> = {
    CLIENT_ID,
    GUILD_ID,
    DISCORD_TOKEN,
}

export const BOT_INTENTS: BitFieldResolvable<IntentsString, number> = ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"];