import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface EnvelopeShape {
  data?: unknown;
  meta?: Record<string, unknown>;
}

/**
 * ตาม api-conventions.md ข้อ 3: ทุก endpoint ที่สำเร็จต้องห่อด้วย
 * { success: true, data: {...}, meta: {...} }
 *
 * Service/Controller คืนค่าปกติ (object หรือ { data, meta } ถ้าต้องการ meta เช่น pagination)
 * interceptor นี้จะจัดรูปให้เอง ไม่ต้องเขียน envelope ซ้ำทุก endpoint
 */
@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result: unknown) => {
        // health endpoint คืน raw shape ของตัวเอง (status, version) ไม่ต้องห่อ
        const req = context.switchToHttp().getRequest();
        if (req.path === '/health') return result;

        if (result && typeof result === 'object' && 'data' in (result as EnvelopeShape)) {
          const { data, meta } = result as EnvelopeShape;
          return meta ? { success: true, data, meta } : { success: true, data };
        }
        return { success: true, data: result ?? null };
      }),
    );
  }
}
