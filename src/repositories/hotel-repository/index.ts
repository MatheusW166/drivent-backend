import { prisma } from '@/config';

function getHotels() {
  return prisma.hotel.findMany();
}

function getHotelWithRooms(hotelId: number) {
  return prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { Rooms: { orderBy: { id: 'asc' } } },
  });
}

function getHotelById(hotelId: number) {
  return prisma.hotel.findUnique({ where: { id: hotelId } });
}

const hotelRepository = { getHotelWithRooms, getHotels, getHotelById };

export default hotelRepository;
