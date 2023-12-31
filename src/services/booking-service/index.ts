import roomRepository from '@/repositories/room-repository';
import { notFoundError, forbiddenError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import ticketsService from '@/services/tickets-service';
import fullRoomError from '@/errors/full-room-error';

async function findByUserId(userId: number) {
  const result = await bookingRepository.findByUserId(userId);
  if (!result) throw notFoundError();
  return result;
}

async function create(userId: number, roomId: number) {
  await ticketsService.getUserPaidTicketWithHotelOrThrown(userId);

  const room = await roomRepository.findById(roomId);
  if (!room) throw notFoundError();

  const count = await bookingRepository.countBookingByRoom(roomId);
  if (room.capacity === count) throw fullRoomError();

  const booking = await bookingRepository.createBooking(userId, roomId);
  return { bookingId: booking.id };
}

async function update(userId: number, bookingId: number, roomId: number) {
  const booking = await bookingRepository.findByUserId(userId);
  if (!booking || bookingId !== booking.id) throw forbiddenError();

  const room = await roomRepository.findById(roomId);
  if (!room) throw notFoundError();

  const count = await bookingRepository.countBookingByRoom(roomId);
  if (room.capacity === count) throw fullRoomError();

  const updatedBooking = await bookingRepository.updateBooking(bookingId, roomId);
  return { bookingId: updatedBooking.id };
}

const bookingService = { findByUserId, create, update };

export default bookingService;
