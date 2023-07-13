import { prisma } from '@/config';

function getHotels() {
  return prisma.hotel.findMany();
}

function getHotelRooms(hotelId: number) {
  return prisma.room.findMany({ where: { hotelId } });
}

const hotelRepository = { getHotelRooms, getHotels };

export default hotelRepository;
