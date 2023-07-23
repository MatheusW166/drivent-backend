import { Room } from '@prisma/client';
import faker from '@faker-js/faker';

export type CreateBookingResponse = { id: number; Room: Room };

export function createBookingResponse(): CreateBookingResponse {
  return {
    id: faker.datatype.number({ min: 1 }),
    Room: {
      id: faker.datatype.number({ min: 1 }),
      hotelId: faker.datatype.number({ min: 1 }),
      name: faker.company.companyName(),
      capacity: faker.datatype.number({ min: 1 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
    },
  };
}

export function createRoomResponse({ capacity }: { capacity?: number }) {
  return {
    id: faker.datatype.number({ min: 1 }),
    hotelId: faker.datatype.number({ min: 1 }),
    name: faker.company.companyName(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    capacity: capacity ?? faker.datatype.number({ min: 1 }),
  };
}
