import {Client, ThreadChannel} from 'discord.js'
import express from 'express'

export function createRestApi(client: Client) {
    const app = express();
    app.use(express.json())

    app.get('/messages', async (req, res) => {
        const {threadId} = req.query;
        if (!threadId) return res.status(400).send('missing threadId')

        const thread = await client.channels.fetch(threadId as string) as ThreadChannel;

        if (!thread) res.status(404).send('Thread not found')

        const messages = await thread.messages.fetch();
        const jsonResponse: string = JSON.stringify(messages || []);
        return res.status(200).send(jsonResponse);
    })

    app.post('/message', async (req, res) => {
        const { threadId, text } = req.body;
        if (!threadId || !text) return res.status(400).send('missing request params')

        const thread = await client.channels.fetch(threadId as string) as ThreadChannel;

        if (!thread) res.status(404).send('Thread not found')
        await thread.send(text);

        return res.status(200).send('Message sent.');
    })

    app.post('/resolve', async (req, res) => {
        const { threadId } = req.body;
        if (!threadId) return res.status(400).send('missing request params')

        const thread = await client.channels.fetch(threadId as string) as ThreadChannel;

        if (!thread) res.status(404).send('Thread not found')
        
        await thread.send('This conversation is marked as resolved and this thread will be archived')
        await thread.setArchived(true);
    })

    return app;
}