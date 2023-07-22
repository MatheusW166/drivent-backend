import Joi from 'joi';

export const createBookingSchema = Joi.object({
  bookingId: Joi.number().integer().min(1).required(),
});
