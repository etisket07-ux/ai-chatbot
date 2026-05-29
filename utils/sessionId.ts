/**
 * Generate or retrieve session ID from localStorage
 * Each browser gets a unique session ID on first visit
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }

  return sessionId;
}

/**
 * Clear session ID (logout functionality)
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sessionId');
  }
}
