import {
	ActionRowBuilder,
	CacheType,
	ComponentType,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { todoModel } from '../schemas/todo';

const TODO_STATUSES = ['Completed', 'In progress'];

export const handleEditTodoCollector = async (
	int: StringSelectMenuInteraction<CacheType>,
	userId: string,
) => {
	const options = TODO_STATUSES.map((status) =>
		new StringSelectMenuOptionBuilder().setLabel(status || 'N/A').setValue(status),
	);

	const todoName = int.values[0];

	const statusSelect = new StringSelectMenuBuilder()
		.setCustomId(int.id)
		.setPlaceholder(`Select a new status for ${todoName}`)
		.addOptions(options);

	const statusRow = new ActionRowBuilder().addComponents(statusSelect);

	const response = await int.reply({
		ephemeral: true,
		content: `Choose a new status for ${todoName}`,
		// @ts-expect-error aaa
		components: [statusRow],
	});

	const statusCollector = response.createMessageComponentCollector({
		componentType: ComponentType.StringSelect,
		filter: (i) => i.user.id === int.user.id && i.customId === int.id,
		time: 30000,
	});

	statusCollector.on('collect', async (statusInteraction) => {
		const newStatus = statusInteraction.values[0];

		const response = await todoModel.findOneAndUpdate(
			{
				userId: userId,
				name: todoName,
			},
			{ status: newStatus },
		);

		console.log({ response });

		statusInteraction.reply({
			content: `You have changed the status of "${todoName}" to "${newStatus}"`,
			ephemeral: true,
		});
	});
};
