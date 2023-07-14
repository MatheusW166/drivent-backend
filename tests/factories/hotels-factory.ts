import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel(hotelId = 1) {
  return prisma.hotel.create({
    data: {
      id: hotelId,
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createHotelRoom(hotelId = 1) {
  return prisma.room.create({
    data: {
      hotelId,
      capacity: faker.datatype.number({ min: 4 }),
      name: faker.random.word(),
    },
  });
}
