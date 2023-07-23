import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const result = await bookingService.findByUserId(userId);
  res.send(result);
}

type CreateBooking = { roomId: number };
type UpdateBooking = CreateBooking;

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as CreateBooking;
  try {
    const result = await bookingService.create(userId, roomId);
    res.send(result);
  } catch (err) {
    if (['FullRoomError', 'PaymentRequired'].includes(err.name)) {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    throw err;
  }
}

type UpdateBookingRequest = AuthenticatedRequest & { params: { bookingId: number } };

export async function updateBooking(req: UpdateBookingRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as UpdateBooking;
  const { bookingId } = req.params;
  try {
    const result = await bookingService.update(userId, bookingId, roomId);
    res.send(result);
  } catch (err) {
    if (err.name === 'FullRoomError') {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    throw err;
  }
}
