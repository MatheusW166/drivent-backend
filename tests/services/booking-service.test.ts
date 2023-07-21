import faker from '@faker-js/faker';
import { createBookingResponse } from '../factories/ booking-factory';
import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Booking service', () => {
  describe('find booking by user ID', () => {
    it('should throw not found error when user has no booking', async () => {
      const fakeId = faker.datatype.number();
      jest.spyOn(bookingRepository, 'findByUserId').mockResolvedValueOnce(null);
      try {
        await bookingService.findByUserId(fakeId);
      } catch (err) {
        expect(err.name).toBe('NotFoundError');
      }
    });

    it('should find user booking', async () => {
      const fakeUserId = faker.datatype.number();
      const fakeBooking = createBookingResponse();

      jest.spyOn(bookingRepository, 'findByUserId').mockResolvedValueOnce(fakeBooking);

      const booking = await bookingService.findByUserId(fakeUserId);
      expect(booking).toEqual(fakeBooking);
    });
  });
});
