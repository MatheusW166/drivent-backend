import { Response } from 'express';
import httpStatus from 'http-status';
import paymentsService from '@/services/payments-service';
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
