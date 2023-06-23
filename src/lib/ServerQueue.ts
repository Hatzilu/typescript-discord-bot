import { TextChannel } from 'discord.js';
import { Song } from '../types';

export class ServerQueue {
	private songs: Song[];
	private textChannel: TextChannel | undefined;

	constructor() {
		this.songs = [];
	}

	public getQueuedSongs(): Song[] {
		return this.songs;
	}

	public addSongToQueue(newSong: Song): void {
		this.songs.push(newSong);
	}

	public getNextSong(): Song | undefined {
		return this.songs.shift();
	}

	public getFirstSong(): Song | undefined {
		return this.songs[0];
	}

	public getTextChannel(): TextChannel | undefined {
		return this.textChannel;
	}

	public setTextChannel(newChannel: TextChannel): void {
		this.textChannel = newChannel;
	}

	public clear(): void {
		this.songs = [];
	}
}
