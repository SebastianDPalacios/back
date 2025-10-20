// src/interfaces/http/routes/project.routes.ts
import { Router } from 'express';
import { ProjectPrismaRepository } from '../../../infrastructure/prisma/project.prisma.repository.js';
import { ProjectService } from '../../../application/project.service.js';
import { ProjectController } from '../controllers/project.controller.js';
import { summarize } from '../../../ai/ai.service.js';

const repo = new ProjectPrismaRepository();
const service = new ProjectService(repo);
const ctl = new ProjectController(service);

const r = Router();

/**
 * @openapi
 * /proyectos:
 *   get:
 *     tags: [Proyectos]
 *     summary: Listar proyectos (paginado + filtros)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [BORRADOR, EN_PROGRESO, PAUSADO, FINALIZADO, CANCELADO]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: OK }
 */
r.get('/', ctl.list);

/**
 * @openapi
 * /proyectos/graficos:
 *   get:
 *     tags: [Proyectos]
 *     summary: Agregados — cantidad de proyectos por estado
 *     responses:
 *       200: { description: OK }
 */
r.get('/graficos', ctl.graficos);

/**
 * @openapi
 * /proyectos/analisis:
 *   post:
 *     tags: [Proyectos]
 *     summary: Resumen con IA de las descripciones de los proyectos
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               extra:
 *                 type: string
 *                 description: Texto adicional para contextualizar el resumen
 *     responses:
 *       200: { description: OK }
 */
r.post('/analisis', async (req, res, next) => {
  try {
    const { items } = await service.list({ page: 1, size: 100 });
    const corpus = items
      .map((p: any) => `• ${p.nombre} [${p.estado}] — ${p.descripcion ?? '(sin descripción)'}`)
      .join('\n');
    const extra = req.body?.extra ? `\nNotas: ${req.body.extra}` : '';
    const summary = await summarize(`Resume en 5-7 bullets:\n${corpus}${extra}`);
    res.json({ total: items.length, summary });
  } catch (e) { next(e); }
});

/**
 * @openapi
 * /proyectos:
 *   post:
 *     tags: [Proyectos]
 *     summary: Crear proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *               estado:
 *                 type: string
 *                 enum: [BORRADOR, EN_PROGRESO, PAUSADO, FINALIZADO, CANCELADO]
 *               fechaInicio: { type: string, format: date-time }
 *               fechaFin: { type: string, format: date-time }
 *               ownerId: { type: integer }
 *     responses:
 *       201: { description: Creado }
 */
r.post('/', ctl.create);

/**
 * @openapi
 * /proyectos/{id}:
 *   get:
 *     tags: [Proyectos]
 *     summary: Obtener proyecto por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: No encontrado }
 */
r.get('/:id', ctl.get);

/**
 * @openapi
 * /proyectos/{id}:
 *   put:
 *     tags: [Proyectos]
 *     summary: Actualizar proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: OK }
 */
r.put('/:id', ctl.update);

/**
 * @openapi
 * /proyectos/{id}:
 *   delete:
 *     tags: [Proyectos]
 *     summary: Eliminar proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Sin contenido }
 */
r.delete('/:id', ctl.remove);

export default r;
