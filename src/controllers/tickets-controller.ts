import { Request, Response } from 'express';
import httpStatus from 'http-status';
import ticketsService from '@/services/tickets-service';

export async function getTicketTypes(_req: Request, res: Response) {
  try {
    res.send(await ticketsService.getTicketTypes());
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}
