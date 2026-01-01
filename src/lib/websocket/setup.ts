import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { WebSocketServerManager } from '@/types/websocket';
import { webSocketServer } from './server';

// Configuration du serveur WebSocket
export const config = {
  api: {
    bodyParser: false, // Désactive le bodyParser pour les WebSockets
  },
};

// Type pour la requête avec WebSocket
type NextApiRequestWithSocket = NextApiRequest & {
  io?: ReturnType<WebSocketServerManager['getIO']>;
  socket?: any;
};

// Type pour la réponse avec WebSocket
type NextApiResponseWithSocket = NextApiResponse & {
  socket?: any;
};

// Type pour le gestionnaire avec WebSocket
type NextApiHandlerWithSocket = (
  req: NextApiRequestWithSocket,
  res: NextApiResponseWithSocket
) => void | Promise<void>;

// Middleware pour intégrer le serveur WebSocket avec Next.js
export const withWebSocket = (handler: NextApiHandlerWithSocket) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Initialiser le serveur WebSocket s'il ne l'est pas déjà
    if (!webSocketServer.getIO()) {
      // Vérifier si le serveur est disponible
      if (res.socket?.server) {
        try {
          // Attacher le serveur WebSocket au serveur HTTP/HTTPS existant
          webSocketServer.initialize();
        } catch (error) {
          console.error('Erreur lors de l\'initialisation du serveur WebSocket:', error);
          return res.status(500).json({ error: 'Erreur serveur' });
        }
      } else {
        console.error('Impossible d\'initialiser le serveur WebSocket: serveur HTTP/HTTPS non disponible');
        return res.status(500).json({ error: 'Serveur non disponible' });
      }
    }

    // Ajouter la référence au serveur WebSocket à la requête et à la réponse
    const reqWithSocket = req as NextApiRequestWithSocket;
    const resWithSocket = res as NextApiResponseWithSocket;
    
    reqWithSocket.io = webSocketServer.getIO();
    resWithSocket.socket = res.socket;
    
    return handler(reqWithSocket, resWithSocket);
  };
};

// Fonction pour initialiser le serveur WebSocket
export const initWebSocketServer = () => {
  // Cette fonction sera appelée lors du démarrage du serveur Next.js
  if (process.env.NEXT_RUNNING_AT) {
    console.log('Initialisation du serveur WebSocket...');
    webSocketServer.initialize();
  }
  return webSocketServer;
};
