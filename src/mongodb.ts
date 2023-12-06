import { connect, connection } from 'mongoose';
import { config } from './config';

export const initializeMongoDB = async () => {
	await connect(config.MONGODB_URL).catch((error) =>
		console.error('Error while connecting to mongoDB: ', error),
	);
};

connection.once('connected', () => {
	console.log('[MongoDB] successfully connected to MongoDB!');
});
connection.once('connecting', () => {
	console.log('[MongoDB] connecting...');
});
connection.once('disconnected', () => {
	console.log('[MongoDB] disconnected from MongoDB');
});
