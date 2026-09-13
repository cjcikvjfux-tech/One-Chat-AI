import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { logger } from '../config/logger.js';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, language, theme, defaultModel } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { ...(name && { name }), ...(language && { language }), ...(theme && { theme }), ...(defaultModel && { defaultModel }) },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    logger.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.get('/models', authenticate, (req, res) => {
  res.json({
    openai: ['gpt-4', 'gpt-3.5-turbo'],
    google: ['gemini-pro'],
    anthropic: ['claude-3-opus-20240229']
  });
});

export default router;