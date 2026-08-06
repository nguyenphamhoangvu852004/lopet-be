import { HttpError } from "~/error/error.custom";

type ExceptionResponse = {
  statusCode: number;
  message: string;
};

export const globalExceptionMiddleware = (error: HttpError, req, res, next) => {
  const statusCode = error.code ?? 500;
  const response: ExceptionResponse = {
    statusCode: statusCode,
    message: error.message,
  };
  res.status(statusCode).json(response);
};
