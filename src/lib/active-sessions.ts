interface ActiveSessions {
  [userId: string]: {
    lastActive: number;
    role: string;
    name: string;
    email: string;
  };
}

const activeSessions: ActiveSessions = {};

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const updateSession = (userId: string, userData: { role: string; name: string; email: string }) => {
  activeSessions[userId] = {
    ...userData,
    lastActive: Date.now()
  };
  return activeSessions[userId];
};

export const removeSession = (userId: string) => {
  delete activeSessions[userId];
};

export const getActiveSessions = () => {
  const now = Date.now();
  // Nettoyer les sessions expirées
  Object.keys(activeSessions).forEach(userId => {
    if (now - activeSessions[userId].lastActive > SESSION_TIMEOUT) {
      delete activeSessions[userId];
    }
  });
  return activeSessions;
};

export const isUserOnline = (userId: string) => {
  const session = activeSessions[userId];
  if (!session) return false;
  return (Date.now() - session.lastActive) < SESSION_TIMEOUT;
};

export const getOnlineAdmins = () => {
  const now = Date.now();
  const admins: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    lastActive: number;
  }> = [];

  Object.entries(activeSessions).forEach(([userId, session]) => {
    if ((session.role === 'ADMIN' || session.role === 'OWNER') && 
        (now - session.lastActive) < SESSION_TIMEOUT) {
      admins.push({
        id: userId,
        name: session.name,
        email: session.email,
        role: session.role,
        lastActive: session.lastActive
      });
    }
  });

  return admins;
};
