import { UserSession } from '@/types/auth';

// Fix for Next.js Fast Refresh losing in-memory sessions
const globalAny: any = global;
if (!globalAny.memorySessionStore) {
  globalAny.memorySessionStore = new Map<string, UserSession>();
}
const memorySessionStore: Map<string, UserSession> = globalAny.memorySessionStore;

export async function saveSession(session: UserSession, ttlSeconds: number = 604800): Promise<void> {
  memorySessionStore.set(session.sessionId, session);
}

export async function getSession(sessionId: string): Promise<UserSession | null> {
  const session = memorySessionStore.get(sessionId);
  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    memorySessionStore.delete(sessionId);
    return null;
  }

  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  memorySessionStore.delete(sessionId);
}

export async function clearAllSessions(): Promise<void> {
  memorySessionStore.clear();
}