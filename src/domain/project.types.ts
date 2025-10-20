// src/domain/project.types.ts

export type ProjectEstado =
  | 'BORRADOR'
  | 'EN_PROGRESO'
  | 'PAUSADO'
  | 'FINALIZADO'
  | 'CANCELADO';

export interface Project {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: ProjectEstado;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  ownerId: number;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface ProjectInput {
  nombre: string;
  descripcion?: string | null;
  estado?: ProjectEstado;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  ownerId?: number;
}

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};
