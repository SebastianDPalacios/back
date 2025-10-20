import { z } from 'zod';

const EstadoEnum = z.enum(['BORRADOR','EN_PROGRESO','PAUSADO','FINALIZADO','CANCELADO']);

export const CreateProjectDto = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  estado: EstadoEnum.optional().default('BORRADOR'),
  fechaInicio: z.coerce.date().optional().nullable(),
  fechaFin: z.coerce.date().optional().nullable(),
  ownerId: z.coerce.number().int().positive().optional(),
});

export const UpdateProjectDto = CreateProjectDto.partial();

// ⬇⬇⬇ AQUI el cambio: defaults garantizan number (no undefined)
export const ListQueryDto = z.object({
  q: z.string().optional(),
  estado: EstadoEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(10),
});
