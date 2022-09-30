import { AudioResource, createAudioResource, StreamType } from '@discordjs/voice';
import ytdl from 'ytdl-core';

export function getSongResourceByYouTubeUrl (url: string): AudioResource {
  const stream = ytdl(url, {
    filter: 'audioonly',
    highWaterMark: 1 << 25
  });
  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary
  });
  return resource;
}
