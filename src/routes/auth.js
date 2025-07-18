import { Router } from 'express';
import { connect, disconnect, getStatus, getQR } from '../services/whatsapp.js';

const router = Router();

router.post('/connect', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await connect(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/disconnect', async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await disconnect(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/status', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const status = await getStatus(userId);
    res.json({ status });
  } catch (err) {
    next(err);
  }
});

router.get('/qr', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const qrData = await getQR(userId);
    res.json(qrData);
  } catch (err) {
    next(err);
  }
});

export default router;
