import { model, Schema } from 'mongoose';

const todoSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: { type: String, required: true },
	userId: { type: String, required: true },
	status: String,
});

export const todoModel = model('Todo', todoSchema, 'todos');
