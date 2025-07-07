export class BaseError extends Error {
  constructor({ errorCode, reason, statusCode = 400, data = null }) {
    super(reason);
    this.errorCode = errorCode;
    this.reason = reason;
    this.statusCode = statusCode;
    this.data = data;
  }
}