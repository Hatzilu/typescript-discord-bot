import {SlashCommandBuilder} from '@discordjs/builders';
import { Client, CommandInteraction, TextChannel } from 'discord.js';
import { createTicket } from '../firebase';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Help command').addStringOption(option => 
        option
        .setName('description')
        .setDescription('Describe your problem')
        .setRequired(true))
    
export async function execute(interaction: CommandInteraction, client: Client) {
    if (!interaction?.channelId) return;
    const channel = await client.channels.fetch(interaction.channelId);
    if (!channel || channel?.type !== 'GUILD_TEXT') return;

    const thread = await (channel as TextChannel).threads.create({
        name: `support-${Date.now()}`,
        reason: `Support Ticket ${Date.now()}`,
    })

    const problemDescription = interaction.options.getString('description')!;
    const {user} = interaction;

    thread.send(`**User:** ${user} \n**Problem:** ${problemDescription}`);

    await createTicket(thread.id, problemDescription);
    
    return interaction.reply({
        content: 'Help is on the way!',
        ephemeral: true, //ephemeral = only the user sending the request can see this message
    })
}   
