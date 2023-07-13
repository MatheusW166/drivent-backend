import * as jwt from 'jsonwebtoken';
import { TicketStatus, TicketType, User } from '@prisma/client';

import { createEnrollmentWithAddress, createTicket, createTicketType, createUser } from './factories';
import { createSession } from './factories/sessions-factory';
import { prisma } from '@/config';

export async function cleanDb() {
  await prisma.address.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.hotel.deleteMany({});
  await prisma.room.deleteMany({});
}

export async function generateValidToken(user?: User) {
  const incomingUser = user || (await createUser());
  const token = jwt.sign({ userId: incomingUser.id }, process.env.JWT_SECRET);

  await createSession(token);

  return token;
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
  return await createTicket(enrollment.id, ticketType.id, ticketStatus);
}
