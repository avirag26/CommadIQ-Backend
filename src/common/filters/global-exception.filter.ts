import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { HttpMessage } from '../enums/http-message.enum';
import {
  ApiErrorDetail,
  ApiFailureResponse,
} from '../interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, body } = this.mapException(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        {
          path: request.url,
          method: request.method,
          status,
          error: exception instanceof Error ? exception.message : exception,
        },
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn({
        path: request.url,
        method: request.method,
        status,
        message: body.message,
      });
    }

    response.status(status).json(body);
  }

  private mapException(exception: unknown): {
    status: number;
    body: ApiFailureResponse;
  } {
    if (exception instanceof HttpException) {
      return this.mapHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        body: {
          success: false,
          message: HttpMessage.VALIDATION_FAILED,
          errors: [{ message: 'Invalid data provided' }],
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        success: false,
        message: HttpMessage.INTERNAL_ERROR,
        errors: [],
      },
    };
  }

  private mapHttpException(exception: HttpException): {
    status: number;
    body: ApiFailureResponse;
  } {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        status,
        body: {
          success: false,
          message: exceptionResponse,
          errors: [],
        },
      };
    }

    const payload = exceptionResponse as Record<string, unknown>;
    const message =
      (typeof payload.message === 'string' && payload.message) ||
      exception.message ||
      HttpMessage.INTERNAL_ERROR;

    const errors = this.extractErrors(payload);

    return {
      status,
      body: {
        success: false,
        message: Array.isArray(payload.message)
          ? HttpMessage.VALIDATION_FAILED
          : message,
        errors,
      },
    };
  }

  private extractErrors(payload: Record<string, unknown>): ApiErrorDetail[] {
    if (Array.isArray(payload.message)) {
      return payload.message.map((item) => ({
        message: String(item),
      }));
    }

    if (Array.isArray(payload.errors)) {
      return payload.errors as ApiErrorDetail[];
    }

    return [];
  }

  private mapPrismaError(error: Prisma.PrismaClientKnownRequestError): {
    status: number;
    body: ApiFailureResponse;
  } {
    switch (error.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          body: {
            success: false,
            message: HttpMessage.CONFLICT,
            errors: [{ message: 'A record with this value already exists' }],
          },
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            success: false,
            message: HttpMessage.NOT_FOUND,
            errors: [{ message: 'The requested record was not found' }],
          },
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            success: false,
            message: 'Database operation failed',
            errors: [],
          },
        };
    }
  }
}
