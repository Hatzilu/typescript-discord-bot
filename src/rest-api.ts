import { Client, ThreadChannel } from 'discord.js';
import express, { Request, Response } from 'express';

export function createRestApi (client: Client): express.Application {
  const app = express();
  app.use(express.json());

  app.get('/messages', (req: Request, res: Response): void => {
    (async () => {
      const { thread } = await getQueryParams(req, res, client);

      const messages = await thread.messages.fetch();
      const jsonResponse: string = JSON.stringify(messages ?? []);
      res.status(200).send(jsonResponse);
    })().catch(console.error);
  });

  app.post('/message', (req: Request, res: Response): void => {
    (async () => {
      const { threadId, text } = req.body;

      const missingParams: boolean = threadId === null ?? threadId === undefined ?? text === null ?? text === undefined;
      if (missingParams) return res.status(400).send('missing request params');

      const thread = await client.channels.fetch(threadId as string) as ThreadChannel;

      const missingThread: boolean = threadId === null ?? threadId === undefined;
      if (missingThread) res.status(404).send('Thread not found');
      await thread.send(text);

      return res.status(200).send('Message sent.');
    })().catch(console.error);
  });

  app.post('/resolve', (req: Request, res: Response): void => {
    (async () => {
      const { thread } = await getQueryParams(req, res, client);

      await thread.send('This conversation is marked as resolved and this thread will be archived');
      await thread.setArchived(true);
    })().catch(console.error);
  });

  return app;
}

async function getQueryParams (req: Request, res: Response, client: Client): Promise<{ thread: ThreadChannel, threadId: any }> {
  const { threadId } = req.query;
  if (threadId === null ?? threadId === undefined) {
    res.status(400).send('missing threadId');
  }

  const thread = await client.channels.fetch(threadId as string) as ThreadChannel;

  if (thread === null ?? threadId === undefined) {
    res.status(404).send('Thread not found');
  }

  return { thread, threadId };
}
