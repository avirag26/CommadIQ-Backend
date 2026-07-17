import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          (data as ApiSuccessResponse).success === true
        ) {
          return data as ApiSuccessResponse;
        }

        return {
          success: true,
          message: 'Success',
          data: data ?? null,
        };
      }),
    );
  }
}
