// src/domain/project.repository.ts
import type { Project, ProjectEstado, ProjectInput, Paged } from './project.types';

export interface ListQuery {
  page: number;
  size: number;
  q?: string;
  estado?: ProjectEstado;
}

export type FindQuery = { id: number };

export interface ProjectRepository {
  list(params: ListQuery): Promise<Paged<Project>>;
  find(q: FindQuery): Promise<Paged<Project>>;         // búsqueda paginada/filtrada
  findById(id: number): Promise<Project | null>;       // obtener 1 por id
  create(data: ProjectInput): Promise<Project>;
  update(id: number, data: Partial<ProjectInput>): Promise<Project>;
  delete(id: number): Promise<void>;
  countByEstado(): Promise<Array<{ estado: string; cantidad: number }>>;
}

export type { Project, ProjectEstado, ProjectInput, Paged };
