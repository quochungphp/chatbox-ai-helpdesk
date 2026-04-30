import { HttpError } from "./http-error.exception.js";

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found", details?: unknown) {
    super(404, "NOT_FOUND", message, details);
  }
}

