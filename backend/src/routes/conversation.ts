import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Conversation } from '../models/Conversation.js';
import { logger } from '../config/logger.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user?.id })
      .select('_id title createdAt updatedAt model')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || conversation.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json(conversation);
  } catch (error) {
    logger.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || conversation.userId !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await Conversation.deleteOne({ _id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;