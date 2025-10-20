import type { Request, Response, NextFunction } from 'express';
import { CreateProjectDto, UpdateProjectDto, ListQueryDto } from '../dto/project.dto.js';
import { ProjectService } from '../../../application/project.service.js';

export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ListQueryDto ahora pone defaults → siempre number
      const q = ListQueryDto.parse(req.query);
      const data = await this.service.list(q);
      res.json(data);
    } catch (e) { next(e); }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const item = await this.service.get(id);
      if (!item) return res.status(404).json({ message: 'No encontrado' });
      res.json(item);
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = CreateProjectDto.parse(req.body);
      const created = await this.service.create(dto);
      res.status(201).json(created);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const patch = UpdateProjectDto.parse(req.body);
      const updated = await this.service.update(id, patch);
      res.json(updated);
    } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.service.remove(id);
      res.status(204).send();
    } catch (e) { next(e); }
  };

  graficos = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.graficos(); // ⬅⬅⬅ antes decía "chart"
      res.json(data);
    } catch (e) { next(e); }
  };
}
