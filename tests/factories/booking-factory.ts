import { Hotel, Room, User } from '@prisma/client';
import faker from '@faker-js/faker';
import { createHotel, createHotelRoom } from './hotels-factory';
import { prisma } from '@/config';

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

export async function generateValidBooking(user: User, hotel?: Hotel, room?: Room) {
  const incomingHotel = hotel ?? (await createHotel());
  const incomingRoom = room ?? (await createHotelRoom(incomingHotel.id));
  return prisma.booking.create({
    data: {
      roomId: incomingRoom.id,
      userId: user.id,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}
