import { Response } from 'express';
import httpStatus from 'http-status';
import ticketsService from '@/services/tickets-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getTicketTypes(_req: AuthenticatedRequest, res: Response) {
  res.send(await ticketsService.getTicketTypes());
}

export async function getTicketByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  res.send(await ticketsService.getTicketByUser(userId));
}

export async function createTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketTypeId } = req.body;

  if (!ticketTypeId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  res.status(httpStatus.CREATED).send(await ticketsService.createTicket(userId, ticketTypeId));
}
