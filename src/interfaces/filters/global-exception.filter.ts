// ===========================================
// INTERFACES LAYER - Global Exception Filter
// Standard error format: { errorCode, message, traceId }
// ===========================================

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DomainError } from '../../domain/errors';

export interface ErrorResponse {
    errorCode: string;
    message: string;
    traceId: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const traceId = (request.headers['x-trace-id'] as string) || uuidv4();

        let status: number;
        let errorCode: string;
        let message: string;

        if (exception instanceof DomainError) {
            // Domain errors
            status = this.domainErrorToHttpStatus(exception.code);
            errorCode = exception.code;
            message = exception.message;
        } else if (exception instanceof HttpException) {
            // NestJS HTTP exceptions
            status = exception.getStatus();
            const response = exception.getResponse() as any;
            errorCode = response.error || 'HTTP_ERROR';
            message = Array.isArray(response.message)
                ? response.message.join(', ')
                : response.message || exception.message;
        } else if (exception instanceof Error) {
            // Unknown errors
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorCode = 'INTERNAL_ERROR';
            message =
                process.env.NODE_ENV === 'production'
                    ? 'An unexpected error occurred'
                    : exception.message;
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errorCode = 'UNKNOWN_ERROR';
            message = 'An unexpected error occurred';
        }

        const errorResponse: ErrorResponse = {
            errorCode,
            message,
            traceId,
        };

        // Log the error
        console.error({
            traceId,
            errorCode,
            message,
            stack: exception instanceof Error ? exception.stack : undefined,
            path: request.url,
            method: request.method,
        });

        response.status(status).json(errorResponse);
    }

    private domainErrorToHttpStatus(code: string): number {
        const statusMap: Record<string, number> = {
            SLOT_CONFLICT: HttpStatus.CONFLICT,
            HOLD_EXPIRED: HttpStatus.GONE,
            INVALID_BOOKING_TRANSITION: HttpStatus.BAD_REQUEST,
            BOOKING_NOT_FOUND: HttpStatus.NOT_FOUND,
            BOOKING_NOT_OWNED: HttpStatus.FORBIDDEN,
            USER_NOT_FOUND: HttpStatus.NOT_FOUND,
            INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
            USER_INACTIVE: HttpStatus.FORBIDDEN,
            VENUE_NOT_FOUND: HttpStatus.NOT_FOUND,
            COURT_NOT_FOUND: HttpStatus.NOT_FOUND,
            OUTSIDE_OPERATING_HOURS: HttpStatus.BAD_REQUEST,
            UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
            FORBIDDEN: HttpStatus.FORBIDDEN,
        };

        return statusMap[code] || HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
