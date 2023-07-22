import { cleanDb } from '../helpers';
import { init } from '@/app';

beforeEach(async () => {
  await init();
  await cleanDb();
});

describe('GET /booking', () => {
  // TODO: integration tests for booking
});
