import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  rename,
  stat,
  WriteStream,
} from 'fs';
import * as path from 'path';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  isProd = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    let stream = null as WriteStream | null;
    let logPath = path.join(process.cwd(), 'logs');
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as any).message;

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (this.isProd) {
      if (!existsSync(logPath)) {
        mkdirSync(logPath, { recursive: true });
      }
      stream = createWriteStream(path.resolve(logPath, 'app.log'), {
        flags: 'a+',
      });

      const time = new Date().toISOString();
      stream.write(`[${time}] ${message}\n`);
      stream.close();

      stat(`${logPath}/app.log`, (error, stats) => {
        if (error) console.log('file log error');
        if (
          stats &&
          (Number(process.env.LOG_MAX_FILE_SIZE) ?? 1024) < stats.size / 1024
        ) {
          const newPath = `${logPath}/app-${new Date().toISOString().replace(/:/g, '-')}.log`;
          rename(`${logPath}/app.log`, newPath, (error) =>
            console.log('file log error'),
          );
        }
      });
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      method: request.method,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
