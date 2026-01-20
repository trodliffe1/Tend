import { Person, HealthStatus, FREQUENCY_DAYS, Note } from '../types';
import { colors } from '../constants/theme';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getHealthStatus(person: Person): HealthStatus {
  if (!person.lastContactDate) {
    return 'overdue';
  }

  const lastContact = new Date(person.lastContactDate);
  const now = new Date();
  const daysSinceContact = Math.floor(
    (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  const targetDays = FREQUENCY_DAYS[person.frequency];
  const warningThreshold = targetDays * 0.8;

  if (daysSinceContact >= targetDays) {
    return 'overdue';
  } else if (daysSinceContact >= warningThreshold) {
    return 'due-soon';
  }
  return 'healthy';
}

export function getDaysUntilDue(person: Person): number {
  if (!person.lastContactDate) {
    return -999; // Very overdue
  }

  const lastContact = new Date(person.lastContactDate);
  const now = new Date();
  const daysSinceContact = Math.floor(
    (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  const targetDays = FREQUENCY_DAYS[person.frequency];
  return targetDays - daysSinceContact;
}

export function sortByUrgency(persons: Person[]): Person[] {
  return [...persons].sort((a, b) => {
    const daysA = getDaysUntilDue(a);
    const daysB = getDaysUntilDue(b);
    return daysA - daysB; // Most overdue first
  });
}

export function getRandomNote(notes: Note[]): Note | null {
  if (notes.length === 0) return null;
  return notes[Math.floor(Math.random() * notes.length)];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function getWarmMessage(person: Person): string {
  const status = getHealthStatus(person);
  const messages = {
    overdue: [
      `${person.name} might be drifting away`,
      `Send a signal to ${person.name}—they're fading from orbit`,
      `${person.name} could use a ping from you`,
      `Time to re-establish contact with ${person.name}?`,
    ],
    'due-soon': [
      `${person.name}'s orbit is getting wider`,
      `Consider sending a signal to ${person.name} soon`,
      `${person.name} is approaching the edge of range`,
    ],
    healthy: [
      `${person.name} is in close orbit—nice work`,
      `Strong signal with ${person.name}`,
      `You're keeping ${person.name} in orbit`,
    ],
  };

  const statusMessages = messages[status];
  return statusMessages[Math.floor(Math.random() * statusMessages.length)];
}

export function getHealthColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return colors.healthy;
    case 'due-soon':
      return colors.dueSoon;
    case 'overdue':
      return colors.overdue;
  }
}

export function getStatusPercentage(person: Person): number {
  if (!person.lastContactDate) {
    return 0;
  }

  const lastContact = new Date(person.lastContactDate);
  const now = new Date();
  const daysSinceContact = Math.floor(
    (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  const targetDays = FREQUENCY_DAYS[person.frequency];
  const percentage = Math.max(0, Math.min(100, ((targetDays - daysSinceContact) / targetDays) * 100));
  return percentage;
}
