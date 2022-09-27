import { AudioResource } from '@discordjs/voice';

export class ServerQueue {
  songs: AudioResource[];
  constructor () {
    this.songs = [];
  }

  getQueuedSongs (): AudioResource[] {
    return this.songs;
  }

  addSongToQueue (newSong: AudioResource): void {
    this.songs.push(newSong);
  }

  getNextSong (): AudioResource | null {
    const nextSong = this.songs.shift();
    if (nextSong === undefined) {
      return null;
    }
    return nextSong;
  }
}
