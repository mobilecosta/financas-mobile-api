import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers, body } = req;
    const userAgent = req.get('user-agent') || '';
    const referer = req.get('referer') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;

      const logMessage = `[${method}] ${originalUrl} - ${statusCode} ${contentLength || ''} - ${ip} - ${userAgent} - ${referer} - ${responseTime}ms`;
      const logDetails = {
        method,
        url: originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
        ip,
        userAgent,
        referer,
        requestHeaders: headers,
        requestBody: body,
        responseHeaders: res.getHeaders(),
      };

      if (statusCode >= 500) {
        this.logger.error(logMessage, JSON.stringify(logDetails));
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage, JSON.stringify(logDetails));
      } else {
        this.logger.log(logMessage, JSON.stringify(logDetails));
      }
    });

    next();
  }
}
