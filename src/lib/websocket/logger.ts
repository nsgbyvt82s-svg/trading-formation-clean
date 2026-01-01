import { Server as WebSocketServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { WS_CONFIG, LOG_LEVELS, MESSAGE_TYPES } from './config';

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  meta?: Record<string, any>;
}

export class Logger {
  private static instance: Logger;
  private io: WebSocketServer | null = null;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public initialize(server: any): void {
    if (this.io) {
      console.warn('WebSocket server already initialized');
      return;
    }

    this.io = new WebSocketServer(server, {
      cors: WS_CONFIG.cors,
      path: WS_CONFIG.path
    });

    this.setupEventHandlers();
    console.log(`WebSocket server started on port ${WS_CONFIG.port}`);
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      // Envoyer les logs récents au nouveau client
      if (this.logs.length > 0) {
        socket.emit('initial_logs', this.logs.slice(-100)); // Envoyer les 100 derniers logs
      }

      // Gérer la déconnexion
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private addLog(level: string, message: string, meta?: Record<string, any>): void {
    const logEntry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      message,
      meta
    };

    // Ajouter le log au tableau
    this.logs.push(logEntry);

    // Limiter la taille du tableau de logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Diffuser le log à tous les clients connectés
    if (this.io) {
      this.io.emit(MESSAGE_TYPES.LOG, logEntry);
    }

    // Afficher également dans la console pour le débogage
    const logMethod = console[level as keyof Console] || console.log;
    logMethod(`[${level.toUpperCase()}] ${message}`, meta || '');
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.addLog(LOG_LEVELS.INFO, message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.addLog(LOG_LEVELS.WARN, message, meta);
  }

  public error(message: string, meta?: Record<string, any>): void {
    this.addLog(LOG_LEVELS.ERROR, message, meta);
  }

  public getLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }
}

export const logger = Logger.getInstance();
