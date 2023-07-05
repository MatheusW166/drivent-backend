import { prisma } from '@/config';

async function findByTicketId(ticketId: number) {
  return prisma.payment.findFirst({ where: { ticketId } });
}

const paymentRepository = {
  findByTicketId,
};

export default paymentRepository;
