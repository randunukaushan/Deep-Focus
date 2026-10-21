import type { FocusSession } from './session-types';

export function getHistoricalSessions(sessions: FocusSession[]) {
  return sessions
    .filter((session) => session.status === 'completed' || session.status === 'cancelled')
    .sort((a, b) => getSessionTimestamp(b).localeCompare(getSessionTimestamp(a)));
}

export function getSessionTimestamp(session: FocusSession) {
  return session.completedAt ?? session.cancelledAt ?? session.createdAt;
}

export function formatSessionDuration(seconds: number, units: { hour: string; minute: string } = { hour: 'h', minute: 'min' }) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  if (minutes < 60) return `${minutes} ${units.minute}`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours} ${units.hour}` : `${hours} ${units.hour} ${remainingMinutes} ${units.minute}`;
}

export function formatSessionDate(session: FocusSession) {
  return new Date(getSessionTimestamp(session)).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
