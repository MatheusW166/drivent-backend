import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { cleanDb, generateValidTicket, generateValidToken } from '../helpers';
import { createUser, createHotel, createEnrollmentWithAddress } from '../factories';
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
    });

    it('should respond 404 if there is no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    describe('when ticket exists', () => {
      it('should respond 402 if ticket is not paid', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'RESERVED', { includesHotel: true, isRemote: false });

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond 402 if ticket is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: true });

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond 402 if ticket doesnt include hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: false, isRemote: false });

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond 404 if there is no hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await generateValidTicket(user, 'PAID', { includesHotel: true, isRemote: false });

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
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
