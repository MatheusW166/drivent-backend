import { prisma } from '@/config';

function getHotels() {
  return prisma.hotel.findMany();
}

function getHotelWithRooms(hotelId: number) {
  return prisma.hotel.findMany({ where: { id: hotelId }, include: { Rooms: true } });
}

function getHotelById(hotelId: number) {
  return prisma.hotel.findUnique({ where: { id: hotelId } });
}

const hotelRepository = { getHotelWithRooms, getHotels, getHotelById };

export default hotelRepository;
