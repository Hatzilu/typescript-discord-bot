import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

import Gamedig from 'gamedig';
import { config } from '../config';

const validateIPv4Address = (ip: string) => {
	const regex = new RegExp(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/g);

	return regex.test(ip);
};

const buildConnectEmbed = (state: Gamedig.QueryResult, password?: string | number | boolean) => {
	let steamRedirectUrl = `${config.STEAM_PORT_REDIRECT_URL}/?ip=${state.connect}`;

	if (password) {
		steamRedirectUrl = steamRedirectUrl.concat(`&password=${password}`);
	}

	console.log({ steamRedirectUrl });

	const embed = new EmbedBuilder()
		.setTitle(state.name)
		.setURL(steamRedirectUrl)
		.setThumbnail(
			'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Team_Fortress_2_style_logo.svg/1024px-Team_Fortress_2_style_logo.svg.png',
		)
		.addFields([
			{ name: 'Players', value: `${state.players.length}/${state.maxplayers}`, inline: true },
			{ name: 'Current map', value: state.map },
		]);

	return embed;
};

export const data = new SlashCommandBuilder()
	.setName('connect')
	.setDescription('format a connect string from an IP address.')
	.addStringOption((opt) =>
		opt
			.setName('address')
			.setDescription('server address, usually an IPv4 address and a port')
			.setRequired(true),
	)
	.addStringOption((opt) =>
		opt.setName('password').setDescription('Server password, leave empty if there is none'),
	);

export async function execute(interaction: CommandInteraction): Promise<void> {
	await interaction.deferReply();

	const address = interaction.options.get('address')?.value;

	if (!address || typeof address !== 'string') {
		await interaction.editReply('Please provide a valid address!');

		return;
	}

	if (!address.includes(':')) {
		await interaction.editReply('Please provide the correct port for the game server!');

		return;
	}

	const [ipv4, port] = address.split(':');

	if (!ipv4) {
		await interaction.editReply('Please provide a valid game server address!');

		return;
	}

	const isIpValid = validateIPv4Address(ipv4);

	if (!isIpValid) {
		await interaction.editReply('Please provide a valid game server address!');

		return;
	}

	// if there's no port specified, try defaulting to 27015 since i think it's the most common one
	const portNumber = Number(port) || 27015;

	Gamedig.query({
		type: 'tf2',
		host: ipv4,
		port: portNumber,
	})
		.then(async (state) => {
			console.log(state);
			const password = interaction.options.get('password')?.value;
			const embed = buildConnectEmbed(state, password);

			await interaction.editReply({ embeds: [embed] });
		})
		.catch(async (error: string) => {
			console.log('Gamedig query error: ', error);
			await interaction.editReply(
				'Error while getting connect stuff, sorry! go yell at angel to fix it',
			);
		});
}
