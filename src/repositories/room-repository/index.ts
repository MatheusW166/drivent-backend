import { prisma } from '@/config';

async function findById(roomId: number) {
  return prisma.room.findUnique({
    where: { id: roomId },
  });
}

async function decrementCapacity(roomId: number) {
  return prisma.room.update({
    data: {
      capacity: { decrement: 1 },
    },
    where: {
      id: roomId,
    },
  });
}
async function incrementCapacity(roomId: number) {
  return prisma.room.update({
    data: {
      capacity: { increment: 1 },
    },
    where: {
      id: roomId,
    },
  });
}

const roomRepository = { findById, decrementCapacity, incrementCapacity };

export default roomRepository;
