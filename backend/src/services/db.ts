import { PrismaClient } from '@prisma/client';

// Mantém uma única instância do Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // Útil para debugar as queries SQL geradas
});

export default prisma;