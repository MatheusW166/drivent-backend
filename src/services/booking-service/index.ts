import { notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';

async function findByUserId(userId: number) {
  const result = await bookingRepository.findByUserId(userId);
  if (!result) throw notFoundError();
  return result;
}

const bookingService = { findByUserId };

export default bookingService;
