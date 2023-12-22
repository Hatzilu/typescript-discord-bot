import {
	SlashCommandBuilder,
	CommandInteraction,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuOptionBuilder,
	StringSelectMenuBuilder,
	ComponentType,
} from 'discord.js';
import mongoose from 'mongoose';
import { todoModel } from '../schemas/todo';
import { handleEditTodoCollector } from '../lib/todo-utils';

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
	.addSubcommand((option) =>
		option
			.setName('remove')
			.setDescription('Remove a to-do')
			.addStringOption((opt) => opt.setName('name').setDescription('Task name').setRequired(true)),
	);

export async function execute(interaction: CommandInteraction): Promise<void> {
	await interaction.deferReply({ ephemeral: true });
	// @ts-expect-error getSubcommand doesn't exist
	const command = interaction.options.getSubcommand();

	console.log({ command });

	switch (command) {
		case 'list': {
			const todos = await todoModel.find().where('userId').equals(interaction.user.id);
			const userNickname = interaction.guild?.members.me?.nickname || interaction.user.username;

			console.log({ todos });
			console.log({ me: interaction.user });

			const fields = todos.map((todo) => ({ name: todo.name || 'N/A', value: todo.status || 'N/A' }));

			// Inside a command, event listener, etc.
			const exampleEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`${userNickname}'s To-Do list`)
				.addFields(fields);

			await interaction.editReply({ embeds: [exampleEmbed] });

			break;
		}
		case 'edit': {
			const todos = await todoModel.find().where('userId').equals(interaction.user.id);

			const options = todos.map((todo) =>
				new StringSelectMenuOptionBuilder().setLabel(todo.name || 'N/A').setValue(todo?.name),
			);

			const select = new StringSelectMenuBuilder()
				.setCustomId(interaction.id)
				.setPlaceholder('Select a task to edit.')
				.addOptions(options);

			const row = new ActionRowBuilder().addComponents(select);

			const message = await interaction.editReply({
				content: 'Choose a task',
				// @ts-expect-error row
				components: [row],
			});

			try {
				const collector = message.createMessageComponentCollector({
					componentType: ComponentType.StringSelect,
					filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
					time: 30000,
				});

				collector.on('collect', (int) => handleEditTodoCollector(int, interaction.user.id));
			} catch (error) {
				console.error('FUCK ', error);
			}

			break;
		}
		case 'add': {
			// @ts-expect-error fuck idk man
			const todoName = interaction.options.getString('name');

			// Check if it already exists

			const existingTodo = await todoModel.findOne({ userId: interaction.user.id, name: todoName });

			if (existingTodo) {
				await interaction.editReply(
					`That task already exists! try creating one with a different name!`,
				);

				return;
			}

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

		case 'remove': {
			// @ts-expect-error fuck idk man
			const todoName = interaction.options.getString('name');

			// Check if it exists
			const existingTodo = await todoModel.findOne({ userId: interaction.user.id, name: todoName });

			if (!existingTodo) {
				await interaction.editReply(
					`There's no task with that name! did you mispell your task name?`,
				);

				return;
			}

			const confirm = new ButtonBuilder()
				.setCustomId('confirm')
				.setLabel('Delete task')
				.setStyle(ButtonStyle.Danger);

			const cancel = new ButtonBuilder()
				.setCustomId('cancel')
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Secondary);

			const row = new ActionRowBuilder().addComponents(cancel, confirm);

			const deleteMessageResponse = await interaction.editReply({
				content: `Are you sure you want to delete "${todoName}"?`,
				// @ts-expect-error row is not assignable
				components: [row],
			});

			try {
				const confirmation = await deleteMessageResponse.awaitMessageComponent({
					filter: (i) => i.user.id === interaction.user.id,
					time: 60000,
				});

				if (confirmation.customId === 'confirm') {
					const deleteRes = await todoModel.deleteOne({
						userId: interaction.user.id,
						name: todoName,
					});

					console.log({ deleteRes });

					if (deleteRes.deletedCount < 1) {
						await interaction.editReply(`Something went wrong while deleting that task!`);

						return;
					}

					await confirmation.update({
						content: `Task "${todoName}" has been deleted.`,
						components: [],
					});

					return;
				}

				await confirmation.update({ content: `Delete cancelled.`, components: [] });
			} catch (error) {
				console.log('try-catch error:', error);

				await interaction.editReply({
					content: 'Confirmation not received within 1 minute, cancelling',
					components: [],
				});
			}

			// await interaction.editReply(`Task "${todoName}" has been deleted.`);

			break;
		}

		default: {
			await interaction.editReply('Something broke, sorry!');

			return;
		}
	}
}
