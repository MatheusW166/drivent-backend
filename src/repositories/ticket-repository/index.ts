import { prisma } from '@/config';

async function findTypes() {
  return await prisma.ticketType.findMany();
}

const ticketRepository = { findTypes };

export default ticketRepository;
