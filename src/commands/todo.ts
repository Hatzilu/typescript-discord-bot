import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import mongoose from 'mongoose';
import { todoModel } from '../schemas/todo';

export const data = new SlashCommandBuilder()
	.setName('todo')
	.setDescription('Create, edit and remove to-dos in your own todo list!')
	.addSubcommand((option) =>
		option
			.setName('add')
			.setDescription('Add a new to-do')
			.addStringOption((opt) => opt.setName('name').setDescription('Task name').setRequired(true)),
	)
	.addSubcommand((option) => option.setName('edit').setDescription('Edit an existing to-do'))
	.addSubcommand((option) => option.setName('list').setDescription('List your to-dos'))
	.addSubcommand((option) => option.setName('remove').setDescription('Remove a to-do'));

export async function execute(interaction: CommandInteraction): Promise<void> {
	await interaction.deferReply();

	// @ts-expect-error getSubcommand doesn't exist
	const command = interaction.options.getSubcommand();

	console.log({ command });

	switch (command) {
		case 'list': {
			const todos = await todoModel.find().where('userId').equals(interaction.user.id);

			console.log({ todos });

			await interaction.editReply(`todo response ${JSON.stringify(todos)}`);

			break;
		}

		case 'add': {
			// @ts-expect-error fuck idk man
			const todoName = interaction.options.getString('name');

			const createdTodo = await todoModel.create({
				_id: new mongoose.Types.ObjectId(),
				name: todoName,
				userId: interaction.user.id,
				status: 'Pending',
			});

			console.log({ createdTodo });

			await interaction.editReply(`Successfully created todo ${createdTodo.name}`);

			break;
		}
		default: {
			await interaction.editReply('Something broke, sorry!');

			return;
		}
	}
}
