export type RelationshipType = 'friend' | 'family' | 'partner' | 'other';

export type ContactFrequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'quarterly';

export type InteractionType = 'text' | 'call' | 'in-person' | 'date-night';

export type HealthStatus = 'healthy' | 'due-soon' | 'overdue';

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string;
  note?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  birthday?: string;  // ISO date string
  info?: string;      // Free form notes
}

export interface Person {
  id: string;
  name: string;
  photo?: string;
  relationshipType: RelationshipType;
  frequency: ContactFrequency;
  lastContactDate: string | null;
  birthday?: string;      // ISO date string
  anniversary?: string;   // ISO date string
  spouse?: FamilyMember;
  kids: FamilyMember[];
  notes: Note[];
  interactions: Interaction[];
  createdAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "08:00"
  preferredTime: string;   // "09:00"
  quietDays: number[];     // 0 = Sunday, 6 = Saturday
}

export interface DateReminderSettings {
  earlyWarningEnabled: boolean;
  earlyWarningDays: number;    // Days before to send early warning
  onTheDayEnabled: boolean;
}

export interface AppSettings {
  notifications: NotificationSettings;
  dateReminders: DateReminderSettings;
}

export const FREQUENCY_DAYS: Record<ContactFrequency, number> = {
  daily: 1,
  weekly: 7,
  fortnightly: 14,
  monthly: 30,
  quarterly: 90,
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  friend: 'Friend',
  family: 'Family',
  partner: 'Partner',
  other: 'Other',
};

export const FREQUENCY_LABELS: Record<ContactFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  fortnightly: 'Every 2 weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  text: 'Text',
  call: 'Call',
  'in-person': 'In Person',
  'date-night': 'Date Night',
};
