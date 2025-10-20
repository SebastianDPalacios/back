import { PrismaClient, ProjectEstado } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1) Usuario dueño (obligatorio por ownerId)
  const owner = await prisma.usuario.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: { nombre: 'Admin', email: 'admin@acme.com' }
  });

  // 2) Proyectos base (usar ENUMS y ownerId)
  const proyectos = [
    {
      nombre: 'Portal Contratos',
      estado: ProjectEstado.EN_PROGRESO,
      descripcion: 'Gestión contractual',
      fechaInicio: new Date(),
      ownerId: owner.id
    },
    {
      nombre: 'App Logística',
      estado: ProjectEstado.PAUSADO,
      descripcion: 'Trazabilidad de entregas',
      ownerId: owner.id
    },
    {
      nombre: 'Landing MKT',
      estado: ProjectEstado.FINALIZADO,
      descripcion: 'Captación de leads',
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-02-15'),
      ownerId: owner.id
    }
  ];

  for (const p of proyectos) {
    await prisma.proyecto.upsert({
      where: { nombre: p.nombre },
      update: p,
      create: p
    });
  }

  console.log('Seed OK');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
