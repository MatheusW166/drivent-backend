import { Response } from 'express';
import httpStatus from 'http-status';
import ticketsService from '@/services/tickets-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getTicketTypes(_req: AuthenticatedRequest, res: Response) {
  try {
    res.send(await ticketsService.getTicketTypes());
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}

export async function getTicketByUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    res.send(await ticketsService.getTicketByUser(userId));
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error);
    }
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}

export async function createTicket(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const { ticketTypeId } = req.body;

    if (!ticketTypeId) {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    res.status(httpStatus.CREATED).send(await ticketsService.createTicket(userId, ticketTypeId));
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error);
    }
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}
