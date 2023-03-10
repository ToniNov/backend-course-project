import { NextFunction, Request, Response } from 'express';
import { STATUS_CODES } from '../enum/statusCodes';
import { ErrorCode } from './error-code';
import { ErrorException } from './error-exception';
import { ErrorModel } from './error-model';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log('Error handling middleware called.');
  console.log('Path:', req.path);
  console.error('Error occured:', err);
  if (err instanceof ErrorException) {
    console.log('Error is known.');
    res.status(err.status!).send(err);
  } else {
    res.status(STATUS_CODES.UNKNOWN_ERROR).send({
      code: ErrorCode.UnknownError,
      status: STATUS_CODES.UNKNOWN_ERROR,
    } as ErrorModel);
  }
};
