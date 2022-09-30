
export class ServerQueue {
  songs: string[];
  constructor () {
    this.songs = [];
  }

  getQueuedUrls (): string[] {
    return this.songs;
  }

  addUrlToQueue (newSong: string): void {
    this.songs.push(newSong);
  }

  getNextUrl (): string | null {
    const nextUrl = this.songs.shift();
    if (nextUrl === undefined) {
      return null;
    }
    return nextUrl;
  }
}
