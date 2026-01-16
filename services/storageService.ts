import { BrewSession, BrewPhase } from '../types';

const STORAGE_KEY = 'brewlog_sessions';

export const getSessions = (): BrewSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load sessions", e);
    return [];
  }
};

export const saveSession = (session: BrewSession): void => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const createNewSession = (name: string, style: string): BrewSession => {
  const newSession: BrewSession = {
    id: crypto.randomUUID(),
    name,
    style,
    createdAt: new Date().toISOString(),
    currentPhase: BrewPhase.Mashing,
    data: {}
  };
  saveSession(newSession);
  return newSession;
};

export const getSessionById = (id: string): BrewSession | undefined => {
  const sessions = getSessions();
  return sessions.find(s => s.id === id);
};