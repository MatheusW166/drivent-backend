import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel(hotelId?: number) {
  return prisma.hotel.create({
    data: {
      id: hotelId,
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createHotelRoom(hotelId: number, capacity?: number) {
  return prisma.room.create({
    data: {
      hotelId,
      capacity: capacity ?? faker.datatype.number({ min: 1 }),
      name: faker.random.word(),
    },
  });
}

export async function createHotelRooms(hotelId: number) {
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
