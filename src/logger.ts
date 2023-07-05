import pino from "pino";

const transport = pino.transport({
    targets: [
        {
            level: 'trace',
            target: 'pino-pretty',
            options: {  },
        },
        {
            level: 'trace',
            target: 'pino/file',
            options: { destination: `./logs/app.log` },
        }
    ]
})

export const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: ['senha'],
  remove: true,
}, transport);
