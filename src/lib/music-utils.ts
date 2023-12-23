import {
	DiscordGatewayAdapterCreator,
	entersState,
	getVoiceConnection,
	joinVoiceChannel,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';

function safelyDestroyConnection(connection: VoiceConnection): void {
	if (connection.state.status === VoiceConnectionStatus.Destroyed) {
		console.log('Tried to destroy a connection when it was already destroyed.');

		return;
	}

	connection.destroy();
}

export async function connectToChannel(channel: VoiceChannel): Promise<VoiceConnection> {
	const connection =
		getVoiceConnection(channel.guild.id) ??
		joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
		});

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		connection.on('stateChange', (_, newState) => {
			console.log(`[Voice connection] state changed to ${newState.status}`);

			if (newState.status !== VoiceConnectionStatus.Disconnected) {
				return;
			}

			if (
				newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
				newState.closeCode === 4014
			) {
				console.log('[Voice connection] websocket close with a 4014 code');
				/**
				 * If the websocket closed with a 4014 code, this means that we
				 * should not manually attempt to reconnect but there is a chance
				 * the connection will recover itself if the reason of disconnect
				 * was due to switching voice channels. This is also the same code
				 * for being kicked from the voice channel so we allow 5 s to figure
				 * out which scenario it is. If the bot has been kicked, we should
				 * destroy the voice connection
				 */

				entersState(connection, VoiceConnectionStatus.Connecting, 5000).catch(() =>
					safelyDestroyConnection(connection),
				);
			} else if (connection.rejoinAttempts < 5) {
				// The disconnect is recoverable, and we have < 5 attempts so we
				// Will reconnect
				setTimeout(connection.rejoin, (connection.rejoinAttempts + 1) * 5_000);
			} else {
				// The disconnect is recoverable, but we have no more attempts
				safelyDestroyConnection(connection);
			}
		});

		return connection;
	} catch (error) {
		safelyDestroyConnection(connection);

		throw error;
	}
}

/**
 * some spotify links have a /intl-{country code}/ part in them that distube hates, so i'm cutting them out
 * if it's not a spotify link, exit early.
 * TODO: remove this function once 'spotify-uri' fixes the error these links cause, and once '@distube/spotify' updates their 'spotify-uri' package.
 */
export const normalizeSpotifyLocalizationLinks = (queryUrlOrString: string) => {
	const spotifyLocalizedUrlRegex = new RegExp(
		/https:\/\/open\.spotify\.com\/intl-(?<countryCode>.+?(?=\/))\//g,
	);

	const result = spotifyLocalizedUrlRegex.exec(queryUrlOrString);

	if (result === null || !result?.groups) {
		return queryUrlOrString;
	}

	const countryCode = result.groups['countryCode'];

	return queryUrlOrString.replace(`/intl-${countryCode}`, '');
};
