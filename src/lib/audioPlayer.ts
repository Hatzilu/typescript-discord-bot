import { AudioPlayerStatus, createAudioPlayer } from '@discordjs/voice';
import { playSong, serverQueue } from './music-utils';

const audioPlayer = createAudioPlayer();

audioPlayer.on(AudioPlayerStatus.Playing, () => {
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
audioPlayer.on(AudioPlayerStatus.Idle, () => {
	const nextSong = serverQueue.getFirstSong();

	console.log('[Audio-Player] player is idle');

	if (nextSong === undefined) {
		console.log('[Audio-Player] no more songs to play, returning from on.idle event...');

		return;
	}

	console.log('[Audio-Player] next song: ', nextSong.url);
	playSong(nextSong, audioPlayer);
});

audioPlayer.on('error', (err) => console.error('[Audio-Player] ', err));

export default audioPlayer;
