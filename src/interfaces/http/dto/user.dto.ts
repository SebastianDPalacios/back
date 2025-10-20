import { z } from 'zod';

export const CreateUserDto = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
});
export const UpdateUserDto = CreateUserDto.partial();

export type CreateUserDto = z.infer<typeof CreateUserDto>;
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
