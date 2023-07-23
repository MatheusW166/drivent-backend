import { prisma } from '@/config';

async function findById(roomId: number) {
  return prisma.room.findUnique({
    where: { id: roomId },
  });
}

const roomRepository = { findById };

export default roomRepository;
