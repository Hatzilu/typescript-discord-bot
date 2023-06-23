import dotenv from 'dotenv';
import { GatewayIntentBits } from 'discord.js';

dotenv.config();

const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN, YOUTUBE_API_KEY } = process.env;

function throwErrIfEnvironmentVarsAreMissing(environmentVars: NodeJS.ProcessEnv) {
	Object.values(environmentVars).forEach((v) => {
		if (!v) {
			throw new Error('missing environment variables');
		}
	});
}

const config = {
	CLIENT_ID: CLIENT_ID ?? '',
	GUILD_ID: GUILD_ID ?? '',
	DISCORD_TOKEN: DISCORD_TOKEN ?? '',
	YOUTUBE_API_KEY: YOUTUBE_API_KEY ?? '',
};

throwErrIfEnvironmentVarsAreMissing(config);

const BOT_INTENTS = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.GuildVoiceStates,
];

export { config, BOT_INTENTS };
