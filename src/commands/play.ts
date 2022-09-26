import { SlashCommandBuilder } from '@discordjs/builders';
import { createAudioPlayer } from '@discordjs/voice';
import { CacheType, Client, CommandInteraction, CommandInteractionOption, Guild, GuildMember, TextChannel, VoiceChannel } from 'discord.js';

export const data = new SlashCommandBuilder().setName('play').setDescription('play a song in VC').addStringOption(option =>
  option
    .setName('song')
    .setDescription('Provide a song name or URL')
    .setRequired(true));

export async function execute (interaction: CommandInteraction, client: Client): Promise<void> {
  const player = createAudioPlayer();
  // const resource = createAudioResource(

  // );

  await interaction.deferReply();
  const songNameOrUrl: CommandInteractionOption<CacheType> | null = interaction.options.get('song');
  if (songNameOrUrl === null) {
    await interaction.reply('Invalid song name or url!');
    return;
  }
  const args: string[] = [songNameOrUrl.value as string];

  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel as VoiceChannel;
  const textChannel = interaction.channel as TextChannel;
  const guild = interaction.guild as Guild;
  if (guild === null) {
    await interaction.reply('Invalid guild!');
    return;
  }
  await playSong(member, voiceChannel, textChannel, guild, args);

  await interaction.reply(`${JSON.stringify(player, null, 2)}`);
  // await interaction.reply(`${JSON.stringify(resource, null, 2)}`);
}

async function playSong (member: GuildMember, voiceChannel: VoiceChannel, textChannel: TextChannel, guild: Guild, args: string[]): Promise<void> {
  // TODO
}
