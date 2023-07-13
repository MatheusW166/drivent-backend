import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import hotelService from '@/services/hotel-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  res.send(await hotelService.getHotels(userId));
}

type GetHotelRoomsRequest = AuthenticatedRequest & {
  params: { hotelId: number };
};

export async function getHotelRooms(req: GetHotelRoomsRequest, res: Response) {
  const { hotelId } = req.params;
  res.send(await hotelService.getHotelRooms(hotelId));
}
