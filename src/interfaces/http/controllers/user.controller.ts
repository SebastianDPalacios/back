import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../../../application/user.service.js';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto.js';

export class UserController {
  constructor(private readonly service: UserService) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.list()); } catch (e) { next(e); }
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
    try { res.status(201).json(await this.service.create(CreateUserDto.parse(req.body))); }
    catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      res.json(await this.service.update(id, UpdateUserDto.parse(req.body)));
    } catch (e) { next(e); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { await this.service.remove(Number(req.params.id)); res.status(204).send(); }
    catch (e) { next(e); }
  };
}
