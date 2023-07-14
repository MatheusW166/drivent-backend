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

export async function createHotelRooms(hotelId = 1) {
  await prisma.room.createMany({
    data: [
      {
        hotelId,
        capacity: faker.datatype.number({ min: 4 }),
        name: faker.random.word(),
      },
      {
        hotelId,
        capacity: faker.datatype.number({ min: 4 }),
        name: faker.random.word(),
      },
    ],
  });

  return prisma.room.findMany({ where: { hotelId }, orderBy: { id: 'asc' } });
}
