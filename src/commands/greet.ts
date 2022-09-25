import {SlashCommandBuilder} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder().setName('greet').setDescription('Holiday-appropriate greeting');

export async function execute(interaction: CommandInteraction) {
    return interaction.reply("! <@"+interaction.user+"> ,ראש השנה שמח");
}