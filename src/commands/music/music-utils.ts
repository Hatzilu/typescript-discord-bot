import {
	AudioPlayerStatus,
	createAudioPlayer,
	createAudioResource,
	DiscordGatewayAdapterCreator,
	entersState,
	getVoiceConnection,
	joinVoiceChannel,
	StreamType,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';
import ytdl from 'ytdl-core';
import { Song } from 'src/types';
import { ServerQueue } from '../../classes/ServerQueue';

export const serverQueue = new ServerQueue();

export const player = createAudioPlayer();

function safelyDestroyConnection(connection: VoiceConnection): void {
	if (connection.state.status === VoiceConnectionStatus.Destroyed) {
		console.log('Tried to destroy a connection when it was already destroyed.');

		return;
	}

	connection.destroy();
}

export function getSongResourceBySongObject(song: Song) {
	const stream = ytdl(song.url, {
		filter: 'audioonly',
		highWaterMark: 1 << 25,
	});

	const resource = createAudioResource(stream, {
		inputType: StreamType.Arbitrary,
		metadata: {
			title: song.info.videoDetails.title,
		},
	});

	return resource;
}

player.on(AudioPlayerStatus.Playing, () => {
	const currentlyPlayingSong = serverQueue.getNextSong();

	if (currentlyPlayingSong === undefined) {
		return;
	}

	console.log(
		`[Audio-Player] now playing: ${currentlyPlayingSong.url} by ${currentlyPlayingSong.requestingUser.username}`,
	);

	const channel = serverQueue.getTextChannel();

	if (channel === undefined) {
		return;
	}

	channel.send(`Now Playing: **${currentlyPlayingSong.info.videoDetails.title}**`).catch(console.error);
});
player.on(AudioPlayerStatus.Idle, () => {
	const nextSong = serverQueue.getFirstSong();

	console.log('[Audio-Player] player is idle');

	if (nextSong === undefined) {
		console.log('[Audio-Player] no more songs to play, returning from on.idle event...');

		return;
	}

	console.log('[Audio-Player] next song: ', nextSong);
	const resource = getSongResourceBySongObject(nextSong);

	player.play(resource);
});

player.on('error', (err) => console.error('[Audio-Player] ', err));

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
