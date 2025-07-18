import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import messageRoutes from './routes/message.js';

const app = express();

const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || '*';

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/message', messageRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`[Backend] Listening on :${PORT}`));
