import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createTicket, getTicketByUser, getTicketTypes } from '@/controllers';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .post('/', createTicket)
  .get('/', getTicketByUser)
  .get('/types', getTicketTypes);

export { ticketsRouter };
