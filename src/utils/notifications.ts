import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Person, AppSettings, FamilyMember } from '../types';
import { getHealthStatus, getRandomNote, getWarmMessage, getDaysUntilDue } from './helpers';

interface UpcomingDate {
  personName: string;
  type: 'birthday' | 'anniversary' | 'spouse_birthday' | 'kid_birthday';
  label: string;
  date: string;  // MM/DD
  daysUntil: number;
}

// Parse MM/DD and get days until next occurrence
function getDaysUntilDate(dateStr: string): number {
  if (!dateStr || !dateStr.includes('/')) return -1;

  const [month, day] = dateStr.split('/').map(Number);
  if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) return -1;

  const now = new Date();
  const thisYear = now.getFullYear();

  // Create date for this year
  let targetDate = new Date(thisYear, month - 1, day);

  // If the date has passed this year, use next year
  if (targetDate < now) {
    targetDate = new Date(thisYear + 1, month - 1, day);
  }

  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Relationship Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8B5CF6',
    });
  }

  return true;
}

// Collect all upcoming dates from persons
function getUpcomingDates(persons: Person[], maxDays: number): UpcomingDate[] {
  const dates: UpcomingDate[] = [];

  for (const person of persons) {
    // Person's birthday
    if (person.birthday) {
      const daysUntil = getDaysUntilDate(person.birthday);
      if (daysUntil >= 0 && daysUntil <= maxDays) {
        dates.push({
          personName: person.name,
          type: 'birthday',
          label: `${person.name}'s birthday`,
          date: person.birthday,
          daysUntil,
        });
      }
    }

    // Person's anniversary
    if (person.anniversary) {
      const daysUntil = getDaysUntilDate(person.anniversary);
      if (daysUntil >= 0 && daysUntil <= maxDays) {
        dates.push({
          personName: person.name,
          type: 'anniversary',
          label: `Anniversary with ${person.name}`,
          date: person.anniversary,
          daysUntil,
        });
      }
    }

    // Spouse's birthday
    if (person.spouse?.birthday) {
      const daysUntil = getDaysUntilDate(person.spouse.birthday);
      if (daysUntil >= 0 && daysUntil <= maxDays) {
        dates.push({
          personName: person.name,
          type: 'spouse_birthday',
          label: `${person.spouse.name}'s birthday (${person.name}'s partner)`,
          date: person.spouse.birthday,
          daysUntil,
        });
      }
    }

    // Kids' birthdays
    for (const kid of person.kids || []) {
      if (kid.birthday) {
        const daysUntil = getDaysUntilDate(kid.birthday);
        if (daysUntil >= 0 && daysUntil <= maxDays) {
          dates.push({
            personName: person.name,
            type: 'kid_birthday',
            label: `${kid.name}'s birthday (${person.name}'s kid)`,
            date: kid.birthday,
            daysUntil,
          });
        }
      }
    }
  }

  return dates.sort((a, b) => a.daysUntil - b.daysUntil);
}

export async function scheduleReminderNotifications(
  persons: Person[],
  settings: AppSettings
): Promise<void> {
  // Cancel all existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.notifications.enabled) {
    return;
  }

  // Schedule date reminders (birthdays & anniversaries)
  await scheduleDateReminders(persons, settings);

  // Get persons who need attention (overdue or due soon)
  const needsAttention = persons.filter(person => {
    const status = getHealthStatus(person);
    return status === 'overdue' || status === 'due-soon';
  });

  if (needsAttention.length === 0) {
    return;
  }

  // Parse preferred time
  const [hours, minutes] = settings.notifications.preferredTime.split(':').map(Number);

  // Schedule a notification for tomorrow at the preferred time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);

  // Check if tomorrow is a quiet day
  const tomorrowDay = tomorrow.getDay();
  if (settings.notifications.quietDays.includes(tomorrowDay)) {
    return;
  }

  // Sort by urgency and pick the most overdue person
  const sortedByUrgency = needsAttention.sort(
    (a, b) => getDaysUntilDue(a) - getDaysUntilDue(b)
  );
  const mostUrgent = sortedByUrgency[0];

  // Create notification content
  let body = getWarmMessage(mostUrgent);

  // Add a note hint if available
  const randomNote = getRandomNote(mostUrgent.notes);
  if (randomNote) {
    body += ` — ask about: ${randomNote.content}`;
  }

  // Schedule the notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Signal Check',
      body,
      data: { personId: mostUrgent.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrow,
    },
  });

  // Schedule a weekly summary if there are multiple people needing attention
  if (needsAttention.length > 1) {
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    weekFromNow.setHours(hours, minutes, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Check-in',
        body: `You have ${needsAttention.length} connections drifting out of range. Open Orbyt to check your orbit.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: weekFromNow,
      },
    });
  }
}

async function scheduleDateReminders(
  persons: Person[],
  settings: AppSettings
): Promise<void> {
  const { dateReminders } = settings;
  if (!dateReminders) return;

  const [hours, minutes] = settings.notifications.preferredTime.split(':').map(Number);

  // Get upcoming dates within the early warning window (or 30 days max)
  const maxDays = Math.max(dateReminders.earlyWarningDays || 7, 30);
  const upcomingDates = getUpcomingDates(persons, maxDays);

  for (const upcoming of upcomingDates) {
    // Schedule on-the-day notification
    if (dateReminders.onTheDayEnabled && upcoming.daysUntil >= 0) {
      const notifDate = new Date();
      notifDate.setDate(notifDate.getDate() + upcoming.daysUntil);
      notifDate.setHours(hours, minutes, 0, 0);

      // Don't schedule if the time has already passed today
      if (notifDate > new Date()) {
        const emoji = upcoming.type === 'anniversary' ? '💍' : '🎂';
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${emoji} ${upcoming.type === 'anniversary' ? 'Anniversary' : 'Birthday'} Today!`,
            body: upcoming.label,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notifDate,
          },
        });
      }
    }

    // Schedule early warning notification
    if (dateReminders.earlyWarningEnabled && upcoming.daysUntil === dateReminders.earlyWarningDays) {
      const notifDate = new Date();
      notifDate.setHours(hours, minutes, 0, 0);

      // Don't schedule if the time has already passed today
      if (notifDate > new Date()) {
        const days = dateReminders.earlyWarningDays;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📅 Upcoming Date',
            body: `${upcoming.label} is in ${days} ${days === 1 ? 'day' : 'days'}`,
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notifDate,
          },
        });
      }
    }
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}
