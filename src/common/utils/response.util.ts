import { ApiSuccessResponse } from '../interfaces/api-response.interface';

export function successResponse<T>(
  data: T,
  message = 'Success',
): ApiSuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}
