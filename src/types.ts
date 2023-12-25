import { Client } from 'discord.js';
import DisTube from 'distube';

export interface Command {
	data: any; // since some commands will complain about type incompatibility if you add .addStringOption, i'll leave it as 'any' for now
	// TODO: fix this
}

/**
 * To avoid a dependency cycle, i inject the DisTube client into the discord Client type,
 * which allows me to access in it every command via client.distube,
 * since i pass client as a parameter to every command.
 */
export type CustomClient = Client<boolean> & { distube?: DisTube };
