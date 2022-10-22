import { TextChannel } from 'discord.js';
import { Song } from '../types';

export class ServerQueue {
  private songs: Song[];
  private textChannel: TextChannel | undefined;

  constructor () {
    this.songs = [];
  }

  getQueuedSongs (): Song[] {
    return this.songs;
  }

  addSongToQueue (newSong: Song): void {
    this.songs.push(newSong);
  }

  getNextSong (): Song | undefined {
    return this.songs.shift();
  }

  getFirstSong (): Song | undefined {
    return this.songs[0];
  }

  getTextChannel (): TextChannel | undefined {
    return this.textChannel;
  }

  setTextChannel (newChannel: TextChannel): void {
    this.textChannel = newChannel;
  }

  clear (): void {
    this.songs = [];
  }
}
