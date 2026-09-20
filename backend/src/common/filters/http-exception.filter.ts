import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../exceptions/app.exception';

/**
 * ห่อทุก error response ด้วย envelope ตาม api-conventions.md ข้อ 4:
 * { success: false, error: { code, message, details } }
 *
 * - ถ้าเป็น AppException (ที่เราโยนเองตามเคสธุรกิจ) ใช้ code/message/details ตรงๆ
 * - ถ้าเป็น error อื่นที่ไม่คาดคิด (bug, DB error ฯลฯ) ห่อเป็น INTERNAL_ERROR เสมอ
 *   ห้ามโชว์ stack trace หรือ error ดิบให้ client เห็น
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppException) {
      return response.status(exception.getStatus()).json({
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
      });
    }

    // ValidationPipe (ถ้าไม่ได้ตั้ง exceptionFactory) หรือ error อื่นจาก Nest
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      this.logger.warn(`Unmapped HttpException: ${exception.message}`);
      return response.status(status >= 500 ? 500 : 422).json({
        success: false,
        error: {
          code: status >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_ERROR',
          message: exception.message,
        },
      });
    }

    // error ที่ไม่คาดคิดจริงๆ (bug/DB) — log ไว้ฝั่งเซิร์ฟเวอร์ แต่ไม่โชว์รายละเอียดให้ client
    this.logger.error('Unhandled exception', exception as Error);
    return response.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์',
      },
    });
  }
}
