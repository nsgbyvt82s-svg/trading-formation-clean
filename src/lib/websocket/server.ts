import { createServer } from 'http';
import { Server as WebSocketServer } from 'socket.io';
import { WS_CONFIG } from './config';
import { logger } from './logger';

class WebSocketServerManager {
  private static instance: WebSocketServerManager;
  private io: WebSocketServer | null = null;
  private httpServer: any = null;

  private constructor() {}

  public static getInstance(): WebSocketServerManager {
    if (!WebSocketServerManager.instance) {
      WebSocketServerManager.instance = new WebSocketServerManager();
    }
    return WebSocketServerManager.instance;
  }

  public initialize(): void {
    if (this.io) {
      console.warn('WebSocket server already initialized');
      return;
    }

    // Créer un serveur HTTP pour le WebSocket
    this.httpServer = createServer();
    
    // Initialiser Socket.IO
    this.io = new WebSocketServer(this.httpServer, {
      cors: WS_CONFIG.cors,
      path: WS_CONFIG.path
    });

    this.setupEventHandlers();
    
    // Démarrer le serveur
    this.httpServer.listen(WS_CONFIG.port, () => {
      console.log(`WebSocket server running on port ${WS_CONFIG.port}`);
      logger.info(`WebSocket server started on port ${WS_CONFIG.port}`);
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Envoyer les logs récents au client
      const recentLogs = logger.getLogs(100);
      if (recentLogs.length > 0) {
        socket.emit('initial_logs', recentLogs);
      }

      // Gérer les messages du client
      socket.on('log_message', (message: string) => {
        logger.info(`Message from client ${socket.id}: ${message}`);
      });

      // Gérer la déconnexion
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public getIO(): WebSocketServer | null {
    return this.io;
  }

  public close(): void {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    if (this.httpServer) {
      this.httpServer.close();
      this.httpServer = null;
    }
  }
}

export const webSocketServer = WebSocketServerManager.getInstance();
