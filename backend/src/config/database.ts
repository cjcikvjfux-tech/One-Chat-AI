import mongoose from 'mongoose';
import { logger } from './logger.js';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not defined');
    await mongoose.connect(mongoUri);
    logger.info('Database connected successfully');
    return mongoose.connection;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export default mongoose;