import winston from 'winston';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  trace: 'magenta',
};

winston.addColors(logColors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata, null, 2)}`;
    }
    return msg;
  })
);

class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.DEBUG_MODE === 'true' ? 'debug' : 'info',
      levels: logLevels,
      format,
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
        }),
      ],
    });
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  trace(message: string, meta?: any) {
    this.logger.log('trace', message, meta);
  }

  startTimer(): () => number {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      return duration;
    };
  }

  logAgentCommunication(fromAgent: string, toAgent: string, message: string, data?: any) {
    this.info(`Agent Communication: ${fromAgent} -> ${toAgent}`, {
      from: fromAgent,
      to: toAgent,
      message,
      data,
      timestamp: new Date(),
    });
  }

  logOrchestrationStep(step: string, details: any) {
    this.debug(`Orchestration Step: ${step}`, details);
  }

  logSnowflakeQuery(query: string, params?: any, duration?: number) {
    this.debug('Snowflake Query Executed', {
      query,
      params,
      duration,
      timestamp: new Date(),
    });
  }

  logError(error: Error, context?: any) {
    this.error(error.message, {
      stack: error.stack,
      context,
      timestamp: new Date(),
    });
  }
}

export const logger = new Logger();