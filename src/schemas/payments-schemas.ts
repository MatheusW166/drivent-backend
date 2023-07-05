import Joi from 'joi';
import { CreatePaymentWithcTicketId, PaymentCard } from '@/services';

export const createPaymentSchema = Joi.object<CreatePaymentWithcTicketId>({
  ticketId: Joi.number().min(0).required(),
  cardData: Joi.object<PaymentCard>({
    cvv: Joi.string().required(),
    expirationDate: Joi.string().required(),
    issuer: Joi.string().required(),
    name: Joi.string().required(),
    number: Joi.string().required(),
  }).required(),
});
