import { type ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import type { AplicationError } from '../../../utils/error-handlers.js';

export const errorsMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
) => {
  let statusCode = 500;
  let errorResponse: { message: string }[] = [];

  if (error instanceof ZodError) {
    statusCode = 400;

    const flattened = error.flatten();
    const fieldErrors = Object.values(flattened.fieldErrors)
      .flat()
      .filter((msg): msg is string => typeof msg === 'string');
    const formErrors = flattened.formErrors.filter(
      (msg): msg is string => typeof msg === 'string',
    );

    errorResponse = [...fieldErrors, ...formErrors].map((message) => ({
      message,
    }));
  } else if (error instanceof Error) {
    const appError = error as Error & Partial<AplicationError>;
    statusCode = appError.statusCode ?? 500;
    errorResponse = [{ message: appError.message ?? 'Internal server error' }];
  } else {
    errorResponse = [{ message: 'Internal server error' }];
  }

  console.error({ status: statusCode, errors: errorResponse });

  res.status(statusCode).json({ error: errorResponse });
};
