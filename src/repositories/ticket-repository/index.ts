import { TicketStatus } from '@prisma/client';
import { prisma } from '@/config';

async function findTypes() {
  return prisma.ticketType.findMany();
}

async function findById(id: number) {
  return prisma.ticket.findUnique({ where: { id } });
}

async function findTypeById(id: number) {
  return prisma.ticketType.findUnique({ where: { id } });
}

async function updateStatus(id: number, status: TicketStatus) {
  return prisma.ticket.update({
    where: { id },
    data: { status },
  });
}

async function findByUser(id: number) {
  const enrollment = await prisma.enrollment.findUnique({ where: { userId: id } });

  if (!enrollment) {
    return null;
  }

  return prisma.ticket.findFirst({
    where: { enrollmentId: enrollment.id },
    include: { TicketType: true },
  });
}

async function create(ticketTypeId: number, enrollmentId: number) {
  return prisma.ticket.create({
    data: {
      ticketTypeId,
      enrollmentId,
      status: 'RESERVED',
    },
    include: { TicketType: true },
  });
}

const ticketRepository = { findTypes, findByUser, create, findTypeById, findById, updateStatus };

export default ticketRepository;
