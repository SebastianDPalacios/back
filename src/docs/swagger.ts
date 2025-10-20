// src/docs/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import type { Express } from 'express';

const cwd = process.cwd();

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Proyectos',
      version: '1.0.0',
      description: 'CRUD Proyectos + agregados + IA',
    },
    servers: [{ url: '/api' }], // coincide con tu prefijo /api
  },
  // ¡Muy importante! Incluir src (dev) y dist (docker/prod)
  apis: [
    path.join(cwd, 'src/interfaces/http/routes/**/*.ts'),
    path.join(cwd, 'src/interfaces/http/controllers/**/*.ts'),
    path.join(cwd, 'dist/interfaces/http/routes/**/*.js'),
    path.join(cwd, 'dist/interfaces/http/controllers/**/*.js'),
  ],
});

/** Monta Swagger UI en /docs */
export function mountSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
