import express from 'express';
import { security } from './middlewares/security.js';
import { apiLimiter } from './middlewares/rate-limit.js';
import { requestId } from './middlewares/request-id.js';
import { httpLogger } from './middlewares/request-logger.js';
import projectRoutes from './interfaces/http/routes/project.routes.js';
import { errorHandler } from './middlewares/error.handler.js';
import { mountSwagger } from './docs/swagger.js';  // ⬅️ importar
import userRoutes from './interfaces/http/routes/user.routes.js';

export function buildServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(requestId);
  app.use(httpLogger);
  app.use(...security);

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api', apiLimiter);
  app.use('/api/proyectos', projectRoutes);
  app.use('/api/usuarios', userRoutes);

  // ⬅️ montamos Swagger
  mountSwagger(app);

  app.use(errorHandler);
  return app;
}
