import { notFoundError, paymentRequiredError } from '@/errors';
import hotelRepository from '@/repositories/hotel-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from '@/repositories/ticket-repository';

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);

  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findByUser(userId);
  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.status !== 'PAID') {
    throw paymentRequiredError();
  }

  const ticketType = await ticketRepository.findTypeById(ticket.ticketTypeId);
  if (!ticketType.includesHotel || ticketType.isRemote) {
    throw paymentRequiredError();
  }

  const hotels = await hotelRepository.getHotels();
  if (hotels.length === 0) {
    throw notFoundError();
  }

  return hotels;
}

async function getHotelRooms(hotelId: number) {
  return hotelRepository.getHotelRooms(hotelId);
}

const hotelService = { getHotelRooms, getHotels };

export default hotelService;
