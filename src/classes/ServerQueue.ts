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
    const nextUrl = this.songs.shift();
    if (nextUrl === undefined) {
      return null;
    }
    return nextUrl;
  }
}
