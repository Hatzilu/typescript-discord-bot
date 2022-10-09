import { AudioPlayerStatus, createAudioPlayer, DiscordGatewayAdapterCreator, entersState, getVoiceConnection, joinVoiceChannel, VoiceConnection, VoiceConnectionDisconnectReason, VoiceConnectionStatus } from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';
import { ServerQueue } from '../../classes/ServerQueue';
import { getSongResourceByYouTubeUrl } from '../../utils';

export const serverQueue = new ServerQueue();
export const player = createAudioPlayer();

player.on(AudioPlayerStatus.Idle, () => {
  const nextSong = serverQueue.getNextSong();
  console.log('player is idle');
  if (nextSong === undefined) {
    console.log('no more songs to play, returning...');
    return;
  }
  console.log('nextSong:', nextSong.url);
  const resource = getSongResourceByYouTubeUrl(nextSong.url);
  player.play(resource);
});

player.on('error', console.error);

export async function connectToChannel (channel: VoiceChannel): Promise<VoiceConnection> {
  const connection = getVoiceConnection(channel.guild.id) ?? joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
  });
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    connection.on('stateChange', (_, newState) => {
      if (newState.status !== VoiceConnectionStatus.Disconnected) {
        return;
      }
      if (
        newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
        newState.closeCode === 4014
      ) {
        /**
         * If the websocket closed with a 4014 code, this means that we
         * should not manually attempt to reconnect but there is a chance
         * the connection will recover itself if the reason of disconnect
         * was due to switching voice channels. This is also the same code
         * for being kicked from the voice channel so we allow 5 s to figure
         * out which scenario it is. If the bot has been kicked, we should
         * destroy the voice connection
         */

        entersState(
          connection,
          VoiceConnectionStatus.Connecting,
          5000
        ).catch(() => connection.destroy());
      } else if (connection.rejoinAttempts < 5) {
        // The disconnect is recoverable, and we have < 5 attempts so we
        // will reconnect
        setTimeout(connection.rejoin, (connection.rejoinAttempts + 1) * 5_000);
      } else {
        // The disconnect is recoverable, but we have no more attempts
        if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
          connection.destroy();
        }
      }
    });
    return connection;
  } catch (error) {
    connection.destroy();
    throw error;
  }
}
