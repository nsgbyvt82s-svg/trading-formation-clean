import fs from 'fs';
import path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), 'data', 'auth_logs.json');

// S'assurer que le fichier de log existe
const ensureLogFileExists = () => {
  const dir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOG_FILE_PATH)) {
    fs.writeFileSync(LOG_FILE_PATH, '[]', 'utf-8');
  }
};

// Ajouter une entrée de log
export const logAuthEvent = async (event: {
  type: 'LOGIN' | 'SIGNUP' | 'LOGOUT';
  userId: string;
  email: string;
  provider?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: Date;
}) => {
  try {
    ensureLogFileExists();
    
    const logEntry = {
      ...event,
      timestamp: (event.timestamp || new Date()).toISOString(),
    };

    const logs = JSON.parse(fs.readFileSync(LOG_FILE_PATH, 'utf-8'));
    logs.push(logEntry);
    
    // Garder uniquement les 1000 entrées les plus récentes
    const recentLogs = logs.slice(-1000);
    
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(recentLogs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erreur lors de l\'écriture des logs d\'authentification:', error);
  }
};

// Récupérer les logs
export const getAuthLogs = async (limit = 100) => {
  try {
    ensureLogFileExists();
    const logs = JSON.parse(fs.readFileSync(LOG_FILE_PATH, 'utf-8'));
    return logs.slice(-limit).reverse(); // Retourne les logs les plus récents d'abord
  } catch (error) {
    console.error('Erreur lors de la lecture des logs d\'authentification:', error);
    return [];
  }
};
