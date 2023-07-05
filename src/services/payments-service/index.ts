import paymentRepository, { CreatePaymentParams } from '@/repositories/payment-repository';
import { notFoundError, unauthorizedError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from '@/repositories/ticket-repository';

async function getPaymentByTicketId(ticketId: number, currentUserId: number) {
  const ticket = await ticketRepository.findById(ticketId);
  if (!ticket) {
    throw notFoundError();
  }

  const enrollment = await enrollmentRepository.findById(ticket.enrollmentId);
  if (!enrollment) {
    throw notFoundError();
  }

  if (enrollment.userId !== currentUserId) {
    throw unauthorizedError();
  }

  return paymentRepository.findByTicketId(ticketId);
}

function getLastFourDigits(value: string) {
  return value.slice(value.length - 4, value.length);
}

async function createPayment(currentUserId: number, { cardData, ticketId }: CreatePaymentWithcTicketId) {
  const ticket = await ticketRepository.findById(ticketId);
  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.status === 'PAID') {
    throw unauthorizedError();
  }

  const enrollment = await enrollmentRepository.findById(ticket.enrollmentId);
  if (enrollment.userId !== currentUserId) {
    throw unauthorizedError();
  }

  await ticketRepository.updateStatus(ticketId, 'PAID');

  const ticketType = await ticketRepository.findTypeById(ticket.ticketTypeId);
  return paymentRepository.create({
    ticketId,
    cardIssuer: cardData.issuer,
    cardLastDigits: getLastFourDigits(cardData.number.toString()),
    value: ticketType.price,
  });
}

export type PaymentCard = {
  issuer: string;
  number: number;
  name: string;
  expirationDate: Date;
  cvv: number;
};

export type CreatePaymentWithcTicketId = Pick<CreatePaymentParams, 'ticketId'> & { cardData: PaymentCard };

const paymentsService = { getPaymentByTicketId, createPayment };

export default paymentsService;
