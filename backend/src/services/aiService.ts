import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../config/logger.js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class AIService {
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;
  private anthropic: Anthropic;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async chat(messages: Message[], model: string): Promise<string> {
    try {
      if (model.startsWith('gpt')) {
        return await this.openaiChat(messages, model);
      } else if (model.startsWith('gemini')) {
        return await this.geminiChat(messages, model);
      } else if (model.startsWith('claude')) {
        return await this.anthropicChat(messages, model);
      }
      throw new Error(`Unknown model: ${model}`);
    } catch (error) {
      logger.error(`Error with model ${model}:`, error);
      throw error;
    }
  }

  private async openaiChat(messages: Message[], model: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model,
      messages: messages as Parameters<typeof this.openai.chat.completions.create>[0]['messages'],
      temperature: 0.7,
      max_tokens: 2000
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');
    return content;
  }

  private async geminiChat(messages: Message[], model: string): Promise<string> {
    const genAI = this.gemini;
    const generativeModel = genAI.getGenerativeModel({ model });
    const userMessage = messages[messages.length - 1]?.content || '';
    const response = await generativeModel.generateContent(userMessage);
    const result = response.response.text();
    if (!result) throw new Error('No response from Gemini');
    return result;
  }

  private async anthropicChat(messages: Message[], model: string): Promise<string> {
    const response = await this.anthropic.messages.create({
      model,
      max_tokens: 2000,
      system: 'You are a helpful AI assistant.',
      messages: messages as Parameters<typeof this.anthropic.messages.create>[0]['messages']
    });
    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');
    return content.text;
  }
}

export const aiService = new AIService();