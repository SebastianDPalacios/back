import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env.js';

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query','error','warn'] : ['error']
});

process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
