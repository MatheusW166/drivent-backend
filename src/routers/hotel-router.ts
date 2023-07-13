import { Router } from 'express';
import { getHotelRoomsSchema } from '../schemas/hotels-schemas';
import { authenticateToken, validateParams } from '@/middlewares';
import { getHotels, getHotelRooms } from '@/controllers';

const hotelsRouter = Router();

hotelsRouter
  .all('/*', authenticateToken)
  .get('/', getHotels)
  .get('/:hotelId', validateParams(getHotelRoomsSchema), getHotelRooms);

export { hotelsRouter };
