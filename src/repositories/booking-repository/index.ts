import roomRepository from '../room-repository';
import { prisma } from '@/config';

async function findByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function createBooking(userId: number, roomId: number) {
  await roomRepository.decrementCapacity(roomId);

  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    select: {
      id: true,
    },
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  await roomRepository.decrementCapacity(roomId);

  await prisma.booking.update({
    where: { id: bookingId },
    data: { Room: { update: { capacity: { increment: 1 } } } },
  });

  return prisma.booking.update({
    data: { roomId },
    where: { id: bookingId },
    select: {
      id: true,
    },
  });
}

const bookingRepository = { findByUserId, createBooking, updateBooking };

export default bookingRepository;
