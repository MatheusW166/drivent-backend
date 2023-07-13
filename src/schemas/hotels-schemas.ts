import Joi from 'joi';

export const getHotelRoomsSchema = Joi.object({
  hotelId: Joi.number().min(1).required(),
});
