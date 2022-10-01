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

  getNextSong (): Song | null {
    const nextSong = this.songs.shift();
    if (nextSong === undefined) {
      return null;
    }
    return nextSong;
  }

  clear (): void {
    this.songs = [];
  }
}
