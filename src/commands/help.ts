import {SlashCommandBuilder} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Help command').addStringOption(option => 
        option
        .setName('description')
        .setDescription('Describe your problem')
        .setRequired(true))
    
export async function execute(interaction: CommandInteraction) {
    return interaction.reply('TODO');
}