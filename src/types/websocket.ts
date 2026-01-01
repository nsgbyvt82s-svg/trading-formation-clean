import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { Server as SocketIOServer, Socket } from 'socket.io';

// Types de base
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  meta?: Record<string, any>;
}

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
}

// Types pour les requêtes et réponses API Next.js
export interface NextApiRequestWithSocket extends Request {
  io?: SocketIOServer;
  socket?: any;
}

export interface NextApiResponseWithSocket extends Response {
  socket?: any;
}

// Types de messages
export const MESSAGE_TYPES = {
  LOG: 'log',
  INITIAL_LOGS: 'initial_logs',
  ERROR: 'error'
} as const;

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

// Événements du client vers le serveur
export const CLIENT_EVENTS = {
  SEND_MESSAGE: 'send_message',
  SUBSCRIBE_LOGS: 'subscribe_logs'
} as const;

// Événements du serveur vers le client
export const SERVER_EVENTS = {
  LOG: MESSAGE_TYPES.LOG,
  INITIAL_LOGS: MESSAGE_TYPES.INITIAL_LOGS,
  ERROR: MESSAGE_TYPES.ERROR
} as const;

// Type pour le gestionnaire de serveur WebSocket
export interface WebSocketServerManager {
  getIO(): SocketIOServer | null;
  initialize(): void;
  attachToServer(server: HttpServer | HttpsServer): void;
  close(): void;
}

// Type pour le gestionnaire de logs
export interface LogManager {
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
  getLogs(limit?: number): LogEntry[];
}
