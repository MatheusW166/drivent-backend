import ticketsService from '@/services/tickets-service';
import { notFoundError } from '@/errors';
import hotelRepository from '@/repositories/hotel-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  await ticketsService.getUserPaidTicketWithHotelOrThrown(userId);

  const hotels = await hotelRepository.getHotels();
  if (hotels.length === 0) {
    throw notFoundError();
  }

  return hotels;
}

async function getHotelWithRooms(hotelId: number, userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  await ticketsService.getUserPaidTicketWithHotelOrThrown(userId);

  const hotel = await hotelRepository.getHotelById(hotelId);
  if (!hotel) {
    throw notFoundError();
  }

  return hotelRepository.getHotelWithRooms(hotelId);
}

const hotelService = { getHotelWithRooms, getHotels };

export default hotelService;
