import { Payment } from '@prisma/client';
import { prisma } from '@/config';

async function findByTicketId(ticketId: number) {
  return prisma.payment.findFirst({ where: { ticketId } });
}

async function create(params: CreatePaymentParams) {
  return prisma.payment.create({
    data: params,
  });
}

export type CreatePaymentParams = Omit<Payment, 'createdAt' | 'updatedAt' | 'id'>;

const paymentRepository = {
  findByTicketId,
  create,
};

export default paymentRepository;
