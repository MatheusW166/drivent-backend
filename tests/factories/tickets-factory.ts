import faker from '@faker-js/faker';
import { Ticket, TicketStatus, TicketType, User } from '@prisma/client';
import { createEnrollmentWithAddress } from './enrollments-factory';
import { prisma } from '@/config';

type CreateTicketResponseProps = Ticket & {
  TicketType: TicketType;
};

export function createTicketResponse(props?: Partial<CreateTicketResponseProps>) {
  const randomIdx = faker.datatype.number({ min: 0, max: 1 });
  const status = randomIdx ? TicketStatus.PAID : TicketStatus.RESERVED;
  return {
    createdAt: props?.createdAt ?? faker.date.past(),
    updatedAt: props?.updatedAt ?? faker.date.soon(),
    enrollmentId: props?.enrollmentId ?? faker.datatype.number({ min: 1 }),
    status: props?.status ?? status,
    id: props?.id ?? faker.datatype.number({ min: 1 }),
    ticketTypeId: props?.ticketTypeId ?? faker.datatype.number({ min: 1 }),
    TicketType: props?.TicketType ?? createTicketTypeResponse(),
  };
}

export function createTicketTypeResponse(props?: Partial<TicketType>) {
  return {
    name: props?.name ?? faker.name.findName(),
    price: props?.price ?? faker.datatype.number(),
    isRemote: props?.isRemote ?? faker.datatype.boolean(),
    includesHotel: props?.includesHotel ?? faker.datatype.boolean(),
    id: props?.id ?? faker.datatype.number({ min: 1 }),
    createdAt: props?.createdAt ?? faker.date.past(),
    updatedAt: props?.updatedAt ?? faker.date.soon(),
  };
}

export async function createTicketType(params?: Partial<TicketType>) {
  return prisma.ticketType.create({
    data: {
      name: params?.name ?? faker.name.findName(),
      price: params?.price ?? faker.datatype.number(),
      isRemote: params?.isRemote ?? faker.datatype.boolean(),
      includesHotel: params?.includesHotel ?? faker.datatype.boolean(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

export async function createTicketTypeRemote() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: true,
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicketTypeWithHotel() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: false,
      includesHotel: true,
    },
  });
}

export async function generateValidTicket(
  user: User,
  ticketStatus: TicketStatus,
  ticketTypeParams: Pick<TicketType, 'includesHotel' | 'isRemote'>,
) {
  const enrollment = await createEnrollmentWithAddress(user);
  const ticketType = await createTicketType({
    ...ticketTypeParams,
  });
  return createTicket(enrollment.id, ticketType.id, ticketStatus);
}

export async function generateValidTicketWithHotel(user: User) {
  return generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: false });
}
