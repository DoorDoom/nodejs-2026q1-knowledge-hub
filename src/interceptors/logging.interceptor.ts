import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import { rename, stat } from 'fs/promises';
import * as path from 'path';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sanitize } from 'src/utils/sanitize';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  isProd = process.env.NODE_ENV === 'production';
  levelLog =
    !this.isProd && process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'log';

  writer = {
    stream: null as WriteStream | null,
    path: path.join(process.cwd(), 'logs'),
    maxSize: Number(process.env.LOG_MAX_FILE_SIZE) ?? 1024,
    initStream: async () => {
      if (!existsSync(this.writer.path)) {
        mkdirSync(this.writer.path, { recursive: true });
      }
      this.writer.stream = createWriteStream(
        path.resolve(this.writer.path, 'app.log'),
        { flags: 'a+' },
      );
    },
    write: async (message: string) => {
      if (!this.writer.stream) {
        throw new Error('Log stream not initialized');
      }

      const time = new Date().toISOString();
      this.writer.stream.write(`[${time}] ${message}\n`);

      const { size } = await stat(`${this.writer.path}/app.log`);
      if (this.writer.maxSize < size / 1024) {
        await this.writer.finishStream();
        this.writer.initStream();
      }
    },
    finishStream: async () => {
      if (!this.writer.stream) return;
      const newPath = `${this.writer.path}/app-${new Date().toISOString().replace(/:/g, '-')}.log`;
      this.writer.stream.close();
      await rename(`${this.writer.path}/app.log`, newPath);
    },
  };

  constructor() {
    if (this.isProd) this.writer.initStream();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const msg = `[${req.method}] ${req.url} - Incoming request: ${sanitize(req.body)}\n Params: ${JSON.stringify(req.query)}`;
    this.logger[this.levelLog](msg);
    if (this.writer.stream) void this.writer.write(msg);

    const now = Date.now();
    return next.handle().pipe(
      map((data) => {
        const msg = `[${req.method}] ${req.url}\n - Outcoming request: ${sanitize(data)} (Responsed in ${Date.now() - now}ms)`;
        this.logger[this.levelLog](msg);
        if (this.writer.stream) void this.writer.write(msg);
        return data;
      }),
    );
  }
}
