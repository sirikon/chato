import { createLogger } from 'winston'
import winston = require('winston')

export const log = createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
