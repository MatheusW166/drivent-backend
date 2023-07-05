import { Response } from 'express';
import httpStatus from 'http-status';
import paymentsService, { CreatePaymentWithcTicketId } from '@/services/payments-service';
import { AuthenticatedRequest } from '@/middlewares';

type GetPaymentByTicketIdQuery = {
  ticketId: string;
};

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId } = req.query as GetPaymentByTicketIdQuery;
  const ticketIdNumber = Number(ticketId);

  if (isNaN(ticketIdNumber)) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  res.send(await paymentsService.getPaymentByTicketId(ticketIdNumber, userId));
}

export async function createPayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { cardData, ticketId } = req.body as CreatePaymentWithcTicketId;

  if (!cardData || !ticketId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  res.status(httpStatus.OK).send(await paymentsService.createPayment(userId, { cardData, ticketId }));
}
