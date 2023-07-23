import { Router } from 'express';
import { createBookingSchema, updateBookingParamsSchema } from '@/schemas/booking-schemas';
import { authenticateToken, validateBody, validateParams } from '@/middlewares';
import { createBooking, getBooking, updateBooking } from '@/controllers';

const bookingRouter = Router();

bookingRouter
  .all('*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(createBookingSchema), createBooking)
  .put('/:bookingId', validateParams(updateBookingParamsSchema), validateBody(createBookingSchema), updateBooking);

export { bookingRouter };
