import { TextChannel } from 'discord.js';
import { Song } from '../types';

export class ServerQueue {
	private songs: Song[];
	private textChannel: TextChannel | undefined;

	constructor() {
		this.songs = [];
	}

	public getQueuedSongs() {
		return this.songs;
	}

	public addSongToQueue(newSong: Song) {
		this.songs.push(newSong);
	}

	public getNextSong() {
		return this.songs.shift();
	}

	public getFirstSong() {
		return this.songs[0];
	}

	public getTextChannel() {
		return this.textChannel;
	}

	public setTextChannel(newChannel: TextChannel) {
		this.textChannel = newChannel;
	}

	public clear() {
		this.songs = [];
	}
}
