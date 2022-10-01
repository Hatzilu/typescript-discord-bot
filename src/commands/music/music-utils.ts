import { createAudioPlayer } from '@discordjs/voice';
import { ServerQueue } from '../../classes/ServerQueue';

const player = createAudioPlayer();
const serverQueue = new ServerQueue();

export { serverQueue, player };
