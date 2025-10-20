import { UserPrismaRepository } from '../infrastructure/prisma/user.prisma.repository.js';
import { CreateUserDto, UpdateUserDto } from '../interfaces/http/dto/user.dto.js';

export class UserService {
  constructor(private readonly repo: UserPrismaRepository) {}

  list() { return this.repo.list(); }
  get(id: number) { return this.repo.findById(id); }
  create(dto: CreateUserDto) { return this.repo.create(dto); }
  update(id: number, patch: UpdateUserDto) { return this.repo.update(id, patch); }
  remove(id: number) { return this.repo.remove(id); }
}
