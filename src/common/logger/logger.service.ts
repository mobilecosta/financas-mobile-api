import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  log(message: string, context?: string, metadata?: any) {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'LOG',
      context: context || this.context,
      message,
      ...(metadata && { metadata }),
    };
    console.log(JSON.stringify(logData));
  }

  error(message: string, trace?: string, context?: string, metadata?: any) {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context: context || this.context,
      message,
      trace,
      ...(metadata && { metadata }),
    };
    console.error(JSON.stringify(logData));
  }

  warn(message: string, context?: string, metadata?: any) {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      context: context || this.context,
      message,
      ...(metadata && { metadata }),
    };
    console.warn(JSON.stringify(logData));
  }

  debug(message: string, context?: string, metadata?: any) {
    if (process.env.NODE_ENV === 'development') {
      const logData = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        context: context || this.context,
        message,
        ...(metadata && { metadata }),
      };
      console.debug(JSON.stringify(logData));
    }
  }
}
