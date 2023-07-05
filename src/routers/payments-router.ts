import { Router } from 'express';
import { createPaymentSchema } from '@/schemas/payments-schemas';
import { createPayment, getPaymentByTicketId } from '@/controllers';
import { authenticateToken, validateBody } from '@/middlewares';

const paymentsRouter = Router();

paymentsRouter
  .all('/*', authenticateToken)
  .get('/', getPaymentByTicketId)
  .post('/process', validateBody(createPaymentSchema), createPayment);

export { paymentsRouter };
