import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { cleanDb, generateFakeId, generateValidToken } from '../helpers';
import {
  createHotel,
  createHotelRoom,
  createUser,
  generateValidTicket,
  generateValidTicketWithHotel,
} from '../factories';
import { generateValidBooking } from '../factories/booking-factory';
import { disconnectDB } from '@/config';
import app, { init } from '@/app';

beforeEach(async () => {
  await init();
  await cleanDb();
});

afterAll(async () => {
  await disconnectDB();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond 404 if user has no booking', async () => {
      const token = await generateValidToken();
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with 200 and the booking of the user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const booking = await generateValidBooking(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        ...booking,
        Room: {
          ...booking.Room,
          createdAt: booking.Room.createdAt.toISOString(),
          updatedAt: booking.Room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond 404 when roomId does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await generateValidTicketWithHotel(user);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: generateFakeId() });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond 403 when room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await generateValidTicketWithHotel(user);
      const hotel = await createHotel();
      const fullRoom = await createHotelRoom(hotel.id, 0);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: fullRoom.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond 403 when ticket is not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await generateValidTicket(user, 'RESERVED', { includesHotel: true, isRemote: false });

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: generateFakeId() });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond 403 when ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: true });

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: generateFakeId() });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond 403 when ticket has no hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await generateValidTicket(user, 'PAID', { includesHotel: false, isRemote: true });

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: generateFakeId() });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond 200 and the created bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await generateValidTicketWithHotel(user);
      const hotel = await createHotel();
      const room = await createHotelRoom(hotel.id, 1);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: expect.any(Number) });
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  const fakeBookingId = generateFakeId();

  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put(`/booking/${fakeBookingId}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.put(`/booking/${fakeBookingId}`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.put(`/booking/${fakeBookingId}`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond 404 when bookingId does not exist', async () => {
      const token = await generateValidToken();

      const response = await server
        .put(`/booking/${fakeBookingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: generateFakeId() });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond 404 when roomId does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const booking = await generateValidBooking(user);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: booking.Room.id + 1 });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond 403 when room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const booking = await generateValidBooking(user);
      const fullRoom = await createHotelRoom(booking.Room.hotelId, 0);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: fullRoom.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond 200 and the updated bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const booking = await generateValidBooking(user);
      const anotherRoom = await createHotelRoom(booking.Room.hotelId);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: anotherRoom.id });
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: booking.id });
    });
  });
});
