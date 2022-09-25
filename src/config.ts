import dotenv from 'dotenv'
import { BitFieldResolvable, IntentsString } from 'discord.js'
dotenv.config()

const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env

throwErrIfEnvironmentVarsAreMissing(process.env)

export const config: Record<string, string> = {
  CLIENT_ID: CLIENT_ID ?? '',
  GUILD_ID: GUILD_ID ?? '',
  DISCORD_TOKEN: DISCORD_TOKEN ?? ''
}

export const BOT_INTENTS: BitFieldResolvable<IntentsString, number> = ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES']

function throwErrIfEnvironmentVarsAreMissing (environmentVars: NodeJS.ProcessEnv): void {
  Object.values(environmentVars).forEach(v => {
    if (v === null || v === undefined) {
      throw new Error('missing environment variables')
    }
  })
}
