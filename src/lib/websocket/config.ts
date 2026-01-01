// Configuration du serveur WebSocket
export const WS_CONFIG = {
  port: process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 3001,
  path: '/ws',
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      : '*',
    methods: ['GET', 'POST']
  }
} as const;

// Niveaux de log
export const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

// Types de messages
export const MESSAGE_TYPES = {
  LOG: 'log',
  AUTH: 'auth',
  ERROR: 'error'
} as const;
