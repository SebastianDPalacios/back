// src/infrastructure/prisma/project.prisma.repository.ts
import { Prisma, ProjectEstado as PrismaProjectEstado } from '@prisma/client';
import { prisma } from './client';
import type {
  ProjectRepository,
  ListQuery,
  FindQuery,
  Paged,
  Project,
  ProjectInput,
  ProjectEstado,
} from '../../domain/project.repository';

export class ProjectPrismaRepository implements ProjectRepository {
  async list(params: ListQuery): Promise<Paged<Project>> {
    const page = params.page ?? 1;
    const size = params.size ?? 10;

    const where: Prisma.ProyectoWhereInput = {
      AND: [
        params.q ? { nombre: { contains: params.q, mode: 'insensitive' } } : {},
        params.estado ? { estado: params.estado as unknown as PrismaProjectEstado } : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.proyecto.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { creadoEn: 'desc' },
      }),
      prisma.proyecto.count({ where }),
    ]);

    return { items: items as unknown as Project[], total, page, size };
  }

  // find de la interfaz: lo tratamos como una list con filtros/paginación
  async find(q: FindQuery): Promise<Paged<Project>> {
    // si solo trae id, devolvemos una “paginada” de 1 resultado
    const item = await this.findById(q.id);
    const items = item ? [item] : [];
    return { items, total: items.length, page: 1, size: 1 };
  }

  async findById(id: number): Promise<Project | null> {
    const p = await prisma.proyecto.findUnique({ where: { id } });
    return p as unknown as Project | null;
  }

  async create(data: ProjectInput): Promise<Project> {
    const DEFAULT_OWNER_ID = 1;

    const mapped: Prisma.ProyectoUncheckedCreateInput = {
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      estado: (data.estado as unknown as PrismaProjectEstado) ?? PrismaProjectEstado.BORRADOR,
      fechaInicio: data.fechaInicio ?? null,
      fechaFin: data.fechaFin ?? null,
      ownerId: data.ownerId ?? DEFAULT_OWNER_ID,
    };

    const created = await prisma.proyecto.create({ data: mapped });
    return created as unknown as Project;
  }

  async update(id: number, data: Partial<ProjectInput>): Promise<Project> {
    const mapped: Prisma.ProyectoUncheckedUpdateInput = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      estado: data.estado ? { set: data.estado as unknown as PrismaProjectEstado } : undefined,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      ownerId: data.ownerId,
    };

    const updated = await prisma.proyecto.update({ where: { id }, data: mapped });
    return updated as unknown as Project;
  }

  async delete(id: number): Promise<void> {
    await prisma.proyecto.delete({ where: { id } });
  }

  async countByEstado(): Promise<Array<{ estado: string; cantidad: number }>> {
    const rows = await prisma.proyecto.groupBy({
      by: ['estado'],
      _count: { estado: true },
    });
    return rows.map((r) => ({
      estado: r.estado as unknown as string,
      cantidad: r._count.estado,
    }));
  }
}
