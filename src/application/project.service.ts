// src/application/project.service.ts
import type { ProjectRepository, ListQuery } from '../domain/project.repository';
import type { ProjectInput } from '../domain/project.types';

export class ProjectService {
  constructor(private readonly repo: ProjectRepository) {}

  list(q: ListQuery) {
    const page = q.page ?? 1;
    const size = q.size ?? 10;
    return this.repo.list({ ...q, page, size });
  }

  get(id: number) {
    return this.repo.findById(id);
  }

  create(data: ProjectInput) {
    return this.repo.create(data);
  }

  update(id: number, data: Partial<ProjectInput>) {
    return this.repo.update(id, data);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }

  graficos() {
    return this.repo.countByEstado();
  }
}
