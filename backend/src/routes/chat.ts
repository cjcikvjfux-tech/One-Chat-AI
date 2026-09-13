import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { Conversation } from '../models/Conversation.js';
import { logger } from '../config/logger.js';

const router = Router();

router.post('/message', authenticate, async (req: AuthRequest, res) => {
  try {
    const { conversationId, message, model } = req.body;
    const userId = req.user?.id;
    if (!userId || !message) return res.status(400).json({ error: 'Missing data' });

    let conversation = null;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    } else {
      conversation = new Conversation({
        userId,
        title: message.substring(0, 50),
        model: model || 'gpt-4',
        messages: []
      });
    }

    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    const response = await aiService.chat(
      conversation.messages.map(m => ({ role: m.role, content: m.content })),
      model || 'gpt-4'
    );

    conversation.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    await conversation.save();
    res.json({ conversationId: conversation._id, message: response, conversation });
  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;