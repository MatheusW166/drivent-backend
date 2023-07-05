import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import enrollmentsService from '@/services/enrollments-service';

export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

    return res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  await enrollmentsService.createOrUpdateEnrollmentWithAddress({
    ...req.body,
    userId: req.userId,
  });
  return res.sendStatus(httpStatus.OK);
}

export function isCepValid(cep: string) {
  return !!cep?.trim() && (!isNaN(Number(cep)) || cep.length === 8);
}

export type GetAddressFromCEPQuery = {
  cep: string;
};

export async function getAddressFromCEP(req: AuthenticatedRequest, res: Response) {
  const { cep } = req.query as GetAddressFromCEPQuery;
  try {
    if (!isCepValid(cep)) {
      return res.sendStatus(httpStatus.NO_CONTENT);
    }

    const address = await enrollmentsService.getAddressFromCEP(cep);
    res.status(httpStatus.OK).send(address);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.send(httpStatus.NO_CONTENT);
    }
    throw error;
  }
}
