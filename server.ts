import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ZodError } from 'zod';
import apiRouter from './src/server/routes';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Centralized Request Logger (Simple Morgan-style)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });

  // API Router First
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ success: true, status: 'healthy', timestamp: new Date() });
  });

  // Centralized Error Handling Middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server Error:', err);

    if (err instanceof ZodError || (err && (err.name === 'ZodError' || Array.isArray(err.issues)))) {
      const issues = err.issues || err.errors || [];
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : '',
          message: e.message || 'Invalid value'
        }))
      });
    }

    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'An unexpected error occurred'
    });
  });

  // Vite static middleware or SPA bundle server
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in DEVELOPMENT mode - Mounting Vite HMR middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in PRODUCTION mode - Serving static assets from dist/');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Pathways Check-in backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
