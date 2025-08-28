import {
  type NextFunction,
  type Response,
  type Request,
  type ErrorRequestHandler,
} from "express";
import { ZodError } from "zod";

export const errorsMiddleware: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  let statusCode = 500;
  let errorResponse: { message: string }[] = [];

  if (error instanceof ZodError) {
    statusCode = 400;

    const flattened = error.flatten();
    const fieldErrors = Object.values(flattened.fieldErrors)
      .flat()
      .filter((msg): msg is string => typeof msg === "string");
    const formErrors = flattened.formErrors.filter(
      (msg): msg is string => typeof msg === "string"
    );

    errorResponse = [...fieldErrors, ...formErrors].map((message) => ({
      message,
    }));
  } else if (error instanceof Error) {
    errorResponse = [{ message: error.message ?? "Internal server error" }];
  } else {
    errorResponse = [{ message: "Internal server error" }];
  }

  console.error({ status: statusCode, errors: errorResponse });

  res.status(statusCode).json({ error: errorResponse });
};
