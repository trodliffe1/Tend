import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Person, AppSettings } from '../types';
import { getHealthStatus, getRandomNote, getWarmMessage, getDaysUntilDue } from './helpers';

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
      lightColor: '#6B8E6B',
    });
  }

  return true;
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
      title: 'Tend Your Garden',
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
        body: `You have ${needsAttention.length} relationships that could use some attention. Open Tend to see who's on your list.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: weekFromNow,
      },
    });
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
