import { Router } from 'express';
import { createBookingSchema } from '@/schemas/booking-schemas';
import { authenticateToken, validateBody } from '@/middlewares';
import { getBooking } from '@/controllers';

const bookingRouter = Router();

bookingRouter
  .all('*', authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(createBookingSchema) /** TODO: controller */)
  .put('/:bookingId', validateBody(createBookingSchema) /** TODO: controller */);

export { bookingRouter };
