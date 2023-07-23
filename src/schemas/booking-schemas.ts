import Joi from 'joi';

export const createBookingSchema = Joi.object({
  roomId: Joi.number().integer().min(1).required(),
});

export const updateBookingParamsSchema = Joi.object({
  bookingId: Joi.number().integer().min(1).required(),
});
