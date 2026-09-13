import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface IConversation extends Document {
  userId: string;
  title: string;
  messages: IMessage[];
  model: string;
}

const messageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  model: { type: String, default: 'gpt-4' }
}, { timestamps: false });

const conversationSchema = new Schema<IConversation>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  messages: [messageSchema],
  model: { type: String, default: 'gpt-4' }
}, { timestamps: true });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);