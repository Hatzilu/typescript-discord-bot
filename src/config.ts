import dotenv from 'dotenv';
import { BitFieldResolvable, IntentsString } from 'discord.js';
dotenv.config();

const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN, YOUTUBE_API_KEY } = process.env;

export const config = {
  CLIENT_ID: CLIENT_ID ?? '',
  GUILD_ID: GUILD_ID ?? '',
  DISCORD_TOKEN: DISCORD_TOKEN ?? '',
  YOUTUBE_API_KEY: YOUTUBE_API_KEY ?? ''
};
throwErrIfEnvironmentVarsAreMissing(config);

export const BOT_INTENTS: BitFieldResolvable<IntentsString, number> = ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES', 'GUILD_VOICE_STATES'];

function throwErrIfEnvironmentVarsAreMissing (environmentVars: NodeJS.ProcessEnv) {
  Object.values(environmentVars).forEach(v => {
    if (v === null || v === undefined) {
      throw new Error('missing environment variables');
    }
  });
}
