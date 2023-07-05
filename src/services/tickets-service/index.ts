import ticketRepository from '@/repositories/ticket-repository';

async function getTicketTypes() {
  return await ticketRepository.findTypes();
}

const ticketsService = { getTicketTypes };

export default ticketsService;
