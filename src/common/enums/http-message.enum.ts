export enum HttpMessage {
  SUCCESS = 'Success',
  CREATED = 'Resource created successfully',
  UPDATED = 'Resource updated successfully',
  DELETED = 'Resource deleted successfully',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'Resource not found',
  CONFLICT = 'Resource already exists',
  VALIDATION_FAILED = 'Validation failed',
  INTERNAL_ERROR = 'An unexpected error occurred',
}
