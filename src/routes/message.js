import { Router } from 'express';
import { sendMessage } from '../services/whatsapp.js';

const router = Router();

router.post('/send', async (req, res, next) => {
  try {
    const { userId, numbers, message } = req.body;
    const result = await sendMessage(userId, numbers, message);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
