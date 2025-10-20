import { prisma } from './client.js';
import { Prisma } from '@prisma/client';
import { User, UserInput } from '../../domain/user.types.js';

export class UserPrismaRepository {
  async list(): Promise<User[]> {
    return prisma.usuario.findMany({ orderBy: { creadoEn: 'desc' } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.usuario.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async create(input: UserInput): Promise<User> {
    const data: Prisma.UsuarioCreateInput = {
      nombre: input.nombre,
      email: input.email,
    };
    return prisma.usuario.create({ data });
  }

  async update(id: number, patch: Partial<UserInput>): Promise<User> {
    return prisma.usuario.update({ where: { id }, data: patch });
  }

  async remove(id: number): Promise<void> {
    await prisma.usuario.delete({ where: { id } });
  }
}
