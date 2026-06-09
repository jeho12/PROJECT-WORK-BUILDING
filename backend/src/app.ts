import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import hpp from 'hpp';
import path from 'path';
import { rootRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import { logger } from './config/logger';

const app = express();

// ── Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allow images/PDFs static serving to frontend
}));
app.use(hpp());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// ── Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Request logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

// ── Serve uploads directory statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── API routes
app.use('/api', rootRouter);

// ── Global error handler (must be last)
app.use(errorHandler);

export { app };
