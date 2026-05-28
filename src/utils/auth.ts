import { UserProfile, UserSession } from '../types';

const USERS_KEY = 'crud_auth_registered_users';
const SESSION_KEY = 'crud_auth_current_session';

const DEFAULT_USERS: Record<string, UserProfile & { passwordHash: string }> = {
  'admin@example.com': {
    id: 'user-admin',
    email: 'admin@example.com',
    displayName: 'Alex Rivera',
    avatarColor: '#2563eb', // Blue
    role: 'Lead Architect',
    bio: 'Lead System Administrator & Database Architect.',
    createdAt: new Date().toISOString(),
    passwordHash: 'Password123' // Simple stored password for sandbox clarity
  }
};

/**
 * Initializes users and retrieves active user session from LocalStorage
 */
export function getRegisteredUsers() {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_USERS;
  }
}

export function saveRegisteredUsers(users: any) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentSession(): UserSession | null {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function saveSession(session: UserSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}
