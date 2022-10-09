import { Song } from '../types';

export class ServerQueue {
  songs: Song[];
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
    const nextSong = this.songs.shift();
    if (nextSong === undefined) {
      return undefined;
    }
    return nextSong;
  }

  clear (): void {
    this.songs = [];
  }
}
