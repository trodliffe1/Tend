import { Person, HealthStatus, FREQUENCY_DAYS, Note } from '../types';

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
      `${person.name} might love to hear from you`,
      `It's been a while since you connected with ${person.name}`,
      `${person.name} would probably appreciate a quick hello`,
      `Time to catch up with ${person.name}?`,
    ],
    'due-soon': [
      `${person.name} might be on your mind soon`,
      `You could reach out to ${person.name} this week`,
      `${person.name} is coming up on your radar`,
    ],
    healthy: [
      `You're doing great staying in touch with ${person.name}`,
      `${person.name} connection is thriving`,
      `Nice work maintaining your bond with ${person.name}`,
    ],
  };

  const statusMessages = messages[status];
  return statusMessages[Math.floor(Math.random() * statusMessages.length)];
}

export function getHealthColor(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return '#4CAF50';
    case 'due-soon':
      return '#FF9800';
    case 'overdue':
      return '#E57373';
  }
}

export function getPlantEmoji(status: HealthStatus): string {
  switch (status) {
    case 'healthy':
      return '🌿';
    case 'due-soon':
      return '🌱';
    case 'overdue':
      return '🥀';
  }
}
