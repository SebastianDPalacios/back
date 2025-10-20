// src/interfaces/http/routes/user.routes.ts
import { Router } from 'express';
import { UserPrismaRepository } from '../../../infrastructure/prisma/user.prisma.repository.js';
import { UserService } from '../../../application/user.service.js';
import { UserController } from '../controllers/user.controller.js';

const repo = new UserPrismaRepository();
const service = new UserService(repo);
const ctl = new UserController(service);

const r = Router();

/**
 * @openapi
 * tags:
 *   - name: Usuarios
 *     description: Gestión de dueños (owners)
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         nombre: { type: string, example: "Admin" }
 *         email: { type: string, format: email, example: "admin@acme.com" }
 *         creadoEn: { type: string, format: date-time }
 *         actualizadoEn: { type: string, format: date-time }
 *     CreateUserDto:
 *       type: object
 *       required: [nombre, email]
 *       properties:
 *         nombre: { type: string, example: "Admin" }
 *         email:  { type: string, format: email, example: "admin@acme.com" }
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         nombre: { type: string, example: "Nuevo Nombre" }
 *         email:  { type: string, format: email, example: "nuevo@acme.com" }
 */

/**
 * @openapi
 * /usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
r.get('/', ctl.list);

/**
 * @openapi
 * /usuarios/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuario por id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: No encontrado
 */
r.get('/:id', ctl.get);

/**
 * @openapi
 * /usuarios:
 *   post:
 *     tags: [Usuarios]
 *     summary: Crear usuario (owner)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *           example:
 *             nombre: "Admin"
 *             email: "admin@acme.com"
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 */
r.post('/', ctl.create);

/**
 * @openapi
 * /usuarios/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *           example:
 *             nombre: "Administrador"
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: No encontrado
 */
r.put('/:id', ctl.update);

/**
 * @openapi
 * /usuarios/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Eliminar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *         example: 1
 *     responses:
 *       204:
 *         description: Eliminado
 *       404:
 *         description: No encontrado
 */
r.delete('/:id', ctl.remove);

export default r;
