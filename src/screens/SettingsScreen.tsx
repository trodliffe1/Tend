import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SatelliteIcon } from '../components/icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { deleteBackup } from '../utils/backup';
import { deleteAllLocalData } from '../database/database';

type RootStackParamList = {
  MainTabs: undefined;
  PersonDetail: { personId: string };
  AddEditPerson: { personId?: string };
  BackupRestore: undefined;
  LocalBackup: undefined;
  PrivacyPolicy: undefined;
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { settings, updateSettings } = useApp();
  const { user, signOut, loading: authLoading, deleteAccount } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    setDeleteLoading(true);
    try {
      // 1. Delete cloud backup (ignore errors - may not exist)
      await deleteBackup();

      // 2. Delete all local data
      await deleteAllLocalData();

      // 3. Delete Supabase auth account
      const { error } = await deleteAccount();
      if (error) {
        Alert.alert('Error', error);
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete:\n\n- Your cloud backup data\n- All local app data\n- Your account\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? All your data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: performAccountDeletion,
                },
              ]
            );
          },
        },
      ]
    );
  };

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

  const handleToggleEarlyWarning = async (enabled: boolean) => {
    const newSettings = {
      ...localSettings,
      dateReminders: { ...localSettings.dateReminders, earlyWarningEnabled: enabled },
    };
    setLocalSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleToggleOnTheDay = async (enabled: boolean) => {
    const newSettings = {
      ...localSettings,
      dateReminders: { ...localSettings.dateReminders, onTheDayEnabled: enabled },
    };
    setLocalSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleEarlyWarningDaysSelect = () => {
    const options = [1, 2, 3, 5, 7, 14, 30];

    Alert.alert(
      'Early Warning',
      'How many days before?',
      [
        ...options.map(days => ({
          text: days === 1 ? '1 day' : `${days} days`,
          onPress: async () => {
            const newSettings = {
              ...localSettings,
              dateReminders: { ...localSettings.dateReminders, earlyWarningDays: days },
            };
            setLocalSettings(newSettings);
            await updateSettings(newSettings);
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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

        {/* Date Reminders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Birthday & Anniversary Reminders</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>On the Day</Text>
              <Text style={styles.settingDescription}>
                Get notified on birthdays & anniversaries
              </Text>
            </View>
            <Switch
              value={localSettings.dateReminders?.onTheDayEnabled ?? true}
              onValueChange={handleToggleOnTheDay}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Early Warning</Text>
              <Text style={styles.settingDescription}>
                Get a heads up before important dates
              </Text>
            </View>
            <Switch
              value={localSettings.dateReminders?.earlyWarningEnabled ?? true}
              onValueChange={handleToggleEarlyWarning}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          {localSettings.dateReminders?.earlyWarningEnabled && (
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleEarlyWarningDaysSelect}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Days Before</Text>
                <Text style={styles.settingDescription}>
                  When to send the early warning
                </Text>
              </View>
              <Text style={styles.settingValue}>
                {localSettings.dateReminders?.earlyWarningDays === 1
                  ? '1 day'
                  : `${localSettings.dateReminders?.earlyWarningDays ?? 7} days`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('BackupRestore')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Cloud Backup</Text>
              <Text style={styles.settingDescription}>
                Encrypted backup to restore on new devices
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('LocalBackup')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Local Backup</Text>
              <Text style={styles.settingDescription}>
                Export or import data as JSON file
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.aboutCard}>
            <View style={styles.aboutTitleContainer}>
              <Text style={styles.aboutTitle}>Orbyt</Text>
              <SatelliteIcon size={24} color={colors.text} style={styles.aboutIcon} />
            </View>
            <Text style={styles.aboutText}>
              A relationship tracker to help you maintain signal with the humans who matter.
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>

          <TouchableOpacity
            style={[styles.settingRow, { marginTop: spacing.sm }]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Text style={styles.settingDescription}>
                How we handle your data
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.accountCard}>
            <Text style={styles.accountLabel}>SIGNED IN AS</Text>
            <Text style={styles.accountEmail}>{user?.email ?? 'Unknown'}</Text>
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={styles.signOutText}>SIGN OUT</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={styles.deleteAccountText}>DELETE ACCOUNT</Text>
            )}
          </TouchableOpacity>
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
  aboutTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  aboutIcon: {
    marginLeft: spacing.sm,
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
  accountCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  accountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  accountEmail: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'monospace',
  },
  signOutButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  deleteAccountButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
    marginTop: spacing.sm,
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
});
