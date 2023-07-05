import paymentRepository from '@/repositories/payment-repository';
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

const paymentsService = { getPaymentByTicketId };

export default paymentsService;
