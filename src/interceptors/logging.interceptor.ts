import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { sanitize } from 'src/utils/sanitize';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger();
  levelLog = process.env.LOG_LEVEL || 'log';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    this.logger[this.levelLog](
      `[${req.method}] ${req.url} - Incoming request: ${sanitize(req.body)} Params: ${JSON.stringify(req.query)}`,
    );

    const now = Date.now();
    return next.handle().pipe(
      map((data) => {
        this.logger[this.levelLog](
          `[${req.method}] ${req.url} - Outcoming request: ${sanitize(data)}`,
        );
        this.logger[this.levelLog](`Responsed in ${Date.now() - now}ms`);
        return data;
      }),
    );
  }
}
