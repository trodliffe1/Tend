import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius } from '../constants/theme';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SettingsScreen() {
  const { settings, updateSettings, exportData } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggleNotifications = async (enabled: boolean) => {
    const newSettings = {
      ...localSettings,
      notifications: { ...localSettings.notifications, enabled },
    };
    setLocalSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleToggleQuietDay = async (day: number) => {
    const quietDays = localSettings.notifications.quietDays.includes(day)
      ? localSettings.notifications.quietDays.filter(d => d !== day)
      : [...localSettings.notifications.quietDays, day];

    const newSettings = {
      ...localSettings,
      notifications: { ...localSettings.notifications, quietDays },
    };
    setLocalSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      await Share.share({
        message: data,
        title: 'Tend - Exported Data',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export data. Please try again.');
    }
  };

  const handleTimeSelect = (field: 'preferredTime' | 'quietHoursStart' | 'quietHoursEnd') => {
    const times = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
      '20:00', '21:00', '22:00', '23:00',
    ];

    const labels: Record<string, string> = {
      preferredTime: 'Notification Time',
      quietHoursStart: 'Quiet Hours Start',
      quietHoursEnd: 'Quiet Hours End',
    };

    Alert.alert(
      labels[field],
      'Select a time',
      [
        ...times.slice(0, 8).map(time => ({
          text: formatTime(time),
          onPress: async () => {
            const newSettings = {
              ...localSettings,
              notifications: { ...localSettings.notifications, [field]: time },
            };
            setLocalSettings(newSettings);
            await updateSettings(newSettings);
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formatTime = (time: string): string => {
    const [hours] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Reminders</Text>
              <Text style={styles.settingDescription}>
                Get gentle nudges to reach out to people
              </Text>
            </View>
            <Switch
              value={localSettings.notifications.enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          {localSettings.notifications.enabled && (
            <>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => handleTimeSelect('preferredTime')}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Reminder Time</Text>
                  <Text style={styles.settingDescription}>
                    When should we send nudges?
                  </Text>
                </View>
                <Text style={styles.settingValue}>
                  {formatTime(localSettings.notifications.preferredTime)}
                </Text>
              </TouchableOpacity>

              <View style={styles.quietDaysSection}>
                <Text style={styles.settingLabel}>Quiet Days</Text>
                <Text style={styles.settingDescription}>
                  No reminders on these days
                </Text>
                <View style={styles.daysContainer}>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        localSettings.notifications.quietDays.includes(index) &&
                          styles.dayButtonSelected,
                      ]}
                      onPress={() => handleToggleQuietDay(index)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          localSettings.notifications.quietDays.includes(index) &&
                            styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>

          <TouchableOpacity style={styles.settingRow} onPress={handleExportData}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Download all your data as JSON
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Tend 🌱</Text>
            <Text style={styles.aboutText}>
              A relationship health tracker to help you nurture the connections that matter most.
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 18,
    color: colors.textLight,
  },
  quietDaysSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayTextSelected: {
    color: colors.surface,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  versionText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: spacing.md,
  },
});
