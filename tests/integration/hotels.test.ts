import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { cleanDb, generateValidTicket, generateValidToken } from '../helpers';
import { createUser, createHotel, createEnrollmentWithAddress, createHotelRooms } from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET hotels/', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond 404 if there is no enrollment', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual({ message: 'No result for this search!' });
    });

    it('should respond 404 if there is no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual({ message: 'No result for this search!' });
    });

    describe('when ticket exists', () => {
      it('should respond 402 if ticket is not paid', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'RESERVED', { includesHotel: true, isRemote: false });

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        expect(response.body).toEqual({ message: 'No payment found' });
      });

      it('should respond 402 if ticket is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: true });

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        expect(response.body).toEqual({ message: 'No payment found' });
      });

      it('should respond 402 if ticket doesnt include hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: false, isRemote: false });

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        expect(response.body).toEqual({ message: 'No payment found' });
      });

      it('should respond 404 if there is no hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: false });

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'No result for this search!' });
      });

      it('should respond 200 and a list of hotels if the user has a paid ticket that includes hotel and is not remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: false });
        const hotel = await createHotel();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([
          {
            ...hotel,
            updatedAt: hotel.updatedAt.toISOString(),
            createdAt: hotel.createdAt.toISOString(),
          },
        ]);
      });
    });
  });
});

describe('GET hotels/:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels/1');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond 404 if there is no enrollment', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual({ message: 'No result for this search!' });
    });

    it('should respond 404 if there is no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual({ message: 'No result for this search!' });
    });

    it('should respond 400 if hotelId is lower than 1', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels/0').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        details: ['"hotelId" must be greater than or equal to 1'],
        message: 'Invalid data',
        name: 'InvalidDataError',
      });
    });

    describe('when ticket exists', () => {
      it('should respond 402 if ticket is not paid', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'RESERVED', { includesHotel: true, isRemote: false });

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        expect(response.body).toEqual({ message: 'No payment found' });
      });

      it('should respond 402 if ticket is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: true });

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        expect(response.body).toEqual({ message: 'No payment found' });
      });

      it('should respond 402 if ticket doesnt include hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: false, isRemote: false });

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        expect(response.body).toEqual({ message: 'No payment found' });
      });

      it('should respond 404 if hotelId doesnt exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: false });

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'No result for this search!' });
      });

      it('should respond 200 and a list of hotel rooms if the user has a paid ticket that includes hotel and is not remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: false });
        const hotel = await createHotel();
        const rooms = await createHotelRooms(hotel.id);

        const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: [
            {
              id: rooms[0].id,
              name: rooms[0].name,
              capacity: rooms[0].capacity,
              hotelId: rooms[0].hotelId,
              createdAt: rooms[0].createdAt.toISOString(),
              updatedAt: rooms[0].updatedAt.toISOString(),
            },
            {
              id: rooms[1].id,
              name: rooms[1].name,
              capacity: rooms[1].capacity,
              hotelId: rooms[1].hotelId,
              createdAt: rooms[1].createdAt.toISOString(),
              updatedAt: rooms[1].updatedAt.toISOString(),
            },
          ],
        });
      });
    });
  });
});
