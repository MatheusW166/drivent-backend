import { notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from '@/repositories/ticket-repository';

async function getTicketTypes() {
  return await ticketRepository.findTypes();
}

async function getTicketByUser(id: number) {
  const ticket = await ticketRepository.findByUser(id);

  if (!ticket) {
    throw notFoundError();
  }

  return ticket;
}

async function createTicket(userId: number, ticketTypeId: number) {
  const ticketType = await ticketRepository.findTypeById(ticketTypeId);
  if (!ticketType) {
    throw notFoundError();
  }

  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  return ticketRepository.create(ticketTypeId, enrollment.id);
}

const ticketsService = { getTicketTypes, getTicketByUser, createTicket };

export default ticketsService;
