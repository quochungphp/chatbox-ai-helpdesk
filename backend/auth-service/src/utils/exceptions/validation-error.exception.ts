import { HttpError } from "./http-error.exception.js";

export class ValidationError extends HttpError {
  constructor(message = "Invalid request input", details?: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

