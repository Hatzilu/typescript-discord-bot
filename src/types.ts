export interface Command {
	data: any; // since some commands will complain about type incompatibility if you add .addStringOption, i'll leave it as 'any' for now
	// TODO: fix this
}
