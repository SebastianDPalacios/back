export type UserInput = {
  nombre: string;
  email: string;
};

export type User = {
  id: number;
  nombre: string;
  email: string;
  creadoEn: Date;
  actualizadoEn: Date;
};
