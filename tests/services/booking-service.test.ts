import faker from '@faker-js/faker';
import { CreateBookingResponse, createBookingResponse, createRoomResponse } from '../factories/booking-factory';
import { createTicketResponse, createTicketTypeResponse } from '../factories';
import ticketRepository from '@/repositories/ticket-repository';
import roomRepository from '@/repositories/room-repository';
import ticketsService from '@/services/tickets-service';
import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';

beforeEach(() => {
  jest.clearAllMocks();
});

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

describe('create booking', () => {
  const fakeUserId = faker.datatype.number({ min: 1 });
  const fakeRoomId = faker.datatype.number({ min: 1 });

  it('should throw not found when roomId does not exist', async () => {
    jest.spyOn(ticketsService, 'getUserPaidTicketWithHotelOrThrown').mockResolvedValue(createTicketResponse());
    jest.spyOn(roomRepository, 'findById').mockResolvedValue(null);

    try {
      await bookingService.create(fakeUserId, fakeRoomId);
    } catch (err) {
      expect(err.name).toBe('NotFoundError');
    }
  });

  it('should throw full room error when room is full', async () => {
    jest.spyOn(ticketsService, 'getUserPaidTicketWithHotelOrThrown').mockResolvedValue(createTicketResponse());
    jest.spyOn(roomRepository, 'findById').mockResolvedValue(createRoomResponse({ capacity: 0 }));

    try {
      await bookingService.create(fakeUserId, fakeRoomId);
    } catch (err) {
      expect(err.name).toBe('FullRoomError');
    }
  });

  it('should throw payment error when ticket is not paid', async () => {
    const fakeTicketType = createTicketTypeResponse({
      isRemote: false,
      includesHotel: true,
    });
    const fakeTicket = createTicketResponse({ status: 'RESERVED', TicketType: fakeTicketType });

    jest.spyOn(ticketRepository, 'findByUser').mockResolvedValue(fakeTicket);
    jest.spyOn(ticketRepository, 'findTypeById').mockResolvedValue(fakeTicketType);

    try {
      await bookingService.create(fakeUserId, fakeRoomId);
    } catch (err) {
      expect(err.name).toBe('PaymentRequired');
    }
  });

  it('should throw payment error when ticket is remote', async () => {
    const fakeTicketType = createTicketTypeResponse({
      includesHotel: true,
      isRemote: true,
    });
    const fakeTicket = createTicketResponse({ status: 'PAID', TicketType: fakeTicketType });

    jest.spyOn(ticketRepository, 'findByUser').mockResolvedValue(fakeTicket);
    jest.spyOn(ticketRepository, 'findTypeById').mockResolvedValue(fakeTicketType);

    try {
      await bookingService.create(fakeUserId, fakeRoomId);
    } catch (err) {
      expect(err.name).toBe('PaymentRequired');
    }
  });

  it('should throw payment error when ticket has no hotel', async () => {
    const fakeTicketType = createTicketTypeResponse({
      includesHotel: false,
    });
    const fakeTicket = createTicketResponse({ status: 'PAID', TicketType: fakeTicketType });

    jest.spyOn(ticketRepository, 'findByUser').mockResolvedValue(fakeTicket);
    jest.spyOn(ticketRepository, 'findTypeById').mockResolvedValue(fakeTicketType);

    try {
      await bookingService.create(fakeUserId, fakeRoomId);
    } catch (err) {
      expect(err.name).toBe('PaymentRequired');
    }
  });

  it('should return created booking', async () => {
    const fakeTicket = createTicketResponse();
    const fakeBooking = createBookingResponse();

    jest.spyOn(ticketsService, 'getUserPaidTicketWithHotelOrThrown').mockResolvedValue(fakeTicket);
    jest.spyOn(roomRepository, 'findById').mockResolvedValue(createRoomResponse({ capacity: 1 }));
    jest.spyOn(bookingRepository, 'createBooking').mockResolvedValue(fakeBooking);

    const response = await bookingService.create(fakeUserId, fakeRoomId);
    expect(response).toEqual({ bookingId: fakeBooking.id });
  });
});

describe('update booking', () => {
  const fakeUserId = faker.datatype.number({ min: 1 });
  const fakeRoomId = faker.datatype.number({ min: 1 });
  const fakeBooking = createBookingResponse();

  it('should throw not found when roomId does not exist', async () => {
    jest.spyOn(bookingRepository, 'findByUserId').mockResolvedValue(fakeBooking);
    jest.spyOn(roomRepository, 'findById').mockResolvedValue(null);

    try {
      await bookingService.update(fakeUserId, fakeBooking.id, fakeRoomId);
    } catch (err) {
      expect(err.name).toBe('NotFoundError');
    }
  });

  it('should throw full room error when room is full', async () => {
    jest.spyOn(bookingRepository, 'findByUserId').mockResolvedValue(fakeBooking);
    jest.spyOn(roomRepository, 'findById').mockResolvedValue(createRoomResponse({ capacity: 0 }));

    try {
      await bookingService.update(fakeUserId, fakeBooking.id, fakeRoomId);
    } catch (err) {
      expect(err.name).toBe('FullRoomError');
    }
  });

  it('should throw forbidden error when user has no booking', async () => {
    jest.spyOn(bookingRepository, 'findByUserId').mockResolvedValue(null);
    jest.spyOn(roomRepository, 'findById').mockResolvedValue(createRoomResponse({}));

    try {
      await bookingService.update(fakeUserId, fakeBooking.id, fakeRoomId);
    } catch (err) {
      expect(err.name).toBe('ForbiddenError');
    }
  });

  it('should return updated booking', async () => {
    const fakeBookingUpdated = JSON.parse(JSON.stringify(fakeBooking)) as CreateBookingResponse;
    fakeBookingUpdated.Room.id = fakeRoomId;

    jest.spyOn(bookingRepository, 'findByUserId').mockResolvedValue(fakeBooking);
    jest.spyOn(roomRepository, 'findById').mockResolvedValue(createRoomResponse({}));
    jest.spyOn(bookingRepository, 'updateBooking').mockResolvedValue(fakeBookingUpdated);

    const response = await bookingService.update(fakeUserId, fakeBooking.id, fakeRoomId);
    expect(response).toEqual({ bookingId: fakeBookingUpdated.id });
  });
});
