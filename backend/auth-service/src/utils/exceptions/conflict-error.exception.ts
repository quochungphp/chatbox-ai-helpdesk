import { HttpError } from "./http-error.exception.js";

export class ConflictError extends HttpError {
  constructor(message = "Resource already exists", details?: unknown) {
    super(409, "CONFLICT", message, details);
  }
}

