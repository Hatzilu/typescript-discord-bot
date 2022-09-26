import { SlashCommandBuilder } from '@discordjs/builders';
import { createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, StreamType, VoiceConnectionStatus } from '@discordjs/voice';
import { Client, CommandInteraction, Guild, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import ytdl from 'ytdl-core';

export const data = new SlashCommandBuilder().setName('stream').setDescription('stream a song in VC').addStringOption(option =>
  option
    .setName('url')
    .setDescription('Provide a song URL')
    .setRequired(true));

export async function execute (interaction: CommandInteraction, client: Client): Promise<void> {
  await interaction.deferReply();

  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel as VoiceChannel;
  // const textChannel = interaction.channel as TextChannel;
  // const guild = interaction.guild as Guild;
  const url = interaction.options.getString('url');
  if (url === null) {
    await interaction.editReply('please provide a valid url!');
    return;
  }
  const player = createAudioPlayer();
  const stream = ytdl(url, {
    filter: 'audioonly',
    highWaterMark: 1 << 25
  });
  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary
  });
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
  });

  connection.on(VoiceConnectionStatus.Signalling, async state => {
    console.log('signalling');
    await interaction.editReply('signalling');
  });
  connection.on(VoiceConnectionStatus.Ready, async state => {
    console.log('ready');
    await interaction.editReply('ready');
    connection.subscribe(player);
    player.play(resource);
  });
  connection.on(VoiceConnectionStatus.Destroyed, async state => {
    console.log('Destroyed');
    await interaction.editReply('Destroyed');
  });
  connection.on(VoiceConnectionStatus.Disconnected, async state => {
    console.log('Disconnected');
    await interaction.editReply('Disconnected');
  });
}

async function playSong (member: GuildMember, voiceChannel: VoiceChannel, textChannel: TextChannel, guild: Guild, args: string[]): Promise<void> {
  // TODO
}
