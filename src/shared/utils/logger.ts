import winston, { format } from 'winston';
const { combine, printf, timestamp } = format;

// logger configuration
const logger: winston.Logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const exitLog = (error: Error | null, event: string): never => {
  // eslint-disable-next-line no-useless-assignment
  let message = '';

  if (error) {
    message = `\n[!Error:][${event}] => ${error}`;
    process.stdout.write(message);
  } else {
    message = `\n![${event}] Event Cause: EXIT`;
    process.stdout.write(message);
  }

  process.exit(error ? 1 : 0);
};

export { logger, exitLog };
