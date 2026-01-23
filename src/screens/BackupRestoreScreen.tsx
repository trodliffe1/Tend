import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import {
  getBackupStatus,
  createBackup,
  restoreBackup,
  deleteBackup,
  BackupMetadata,
} from '../utils/backup';
import { useApp } from '../context/AppContext';

export default function BackupRestoreScreen() {
  const { refreshData } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [backupStatus, setBackupStatus] = useState<BackupMetadata>({
    exists: false,
    updatedAt: null,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadBackupStatus = useCallback(async () => {
    setStatusLoading(true);
    const status = await getBackupStatus();
    setBackupStatus(status);
    setStatusLoading(false);
  }, []);

  useEffect(() => {
    loadBackupStatus();
  }, [loadBackupStatus]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBackup = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter a backup password' });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await createBackup(password);

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Backup created successfully' });
      setPassword('');
      await loadBackupStatus();
    }

    setLoading(false);
  };

  const handleRestore = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your backup password' });
      return;
    }

    Alert.alert(
      'Restore Backup',
      'This will replace all current data with your backup. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setMessage(null);

            const result = await restoreBackup(password);

            if (result.error) {
              setMessage({ type: 'error', text: result.error });
            } else {
              setMessage({ type: 'success', text: 'Data restored successfully' });
              setPassword('');
              // Refresh app data to reflect restored data
              await refreshData();
            }

            setLoading(false);
          },
        },
      ]
    );
  };

  const handleDeleteBackup = () => {
    Alert.alert(
      'Delete Backup',
      'Are you sure you want to delete your cloud backup? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setMessage(null);

            const result = await deleteBackup();

            if (result.error) {
              setMessage({ type: 'error', text: result.error });
            } else {
              setMessage({ type: 'success', text: 'Backup deleted' });
              await loadBackupStatus();
            }

            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>SECURE CLOUD</Text>
          <Text style={styles.title}>BACKUP</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Your data is encrypted on your device before upload.
            Only you can decrypt it with your backup password.
          </Text>
          <Text style={styles.warningText}>
            If you forget your backup password, your data cannot be recovered.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>BACKUP STATUS</Text>
          {statusLoading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              <Text style={styles.statusValue}>
                {backupStatus.exists ? 'Backup exists' : 'No backup found'}
              </Text>
              {backupStatus.exists && (
                <Text style={styles.statusDate}>
                  Last updated: {formatDate(backupStatus.updatedAt)}
                </Text>
              )}
            </>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>BACKUP PASSWORD</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password..."
              placeholderTextColor={colors.textLight}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.showButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showButtonText}>
                {showPassword ? 'HIDE' : 'SHOW'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Use a strong, memorable password. Minimum 8 characters.
          </Text>

          {message && (
            <View
              style={[
                styles.messageContainer,
                message.type === 'error' ? styles.errorMessage : styles.successMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.type === 'error' ? styles.errorText : styles.successText,
                ]}
              >
                {message.type === 'error' ? '!' : '+'} {message.text}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleBackup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {backupStatus.exists ? 'UPDATE BACKUP' : 'CREATE BACKUP'}
              </Text>
            )}
          </TouchableOpacity>

          {backupStatus.exists && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
              onPress={handleRestore}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>RESTORE FROM BACKUP</Text>
            </TouchableOpacity>
          )}

          {backupStatus.exists && (
            <TouchableOpacity
              style={[styles.button, styles.dangerButton, loading && styles.buttonDisabled]}
              onPress={handleDeleteBackup}
              disabled={loading}
            >
              <Text style={styles.dangerButtonText}>DELETE BACKUP</Text>
            </TouchableOpacity>
          )}
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
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: 12,
    color: colors.secondary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  statusCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'monospace',
  },
  statusDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginTop: spacing.xs,
  },
  form: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'monospace',
  },
  showButton: {
    padding: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  showButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  hint: {
    fontSize: 11,
    color: colors.textLight,
    fontFamily: 'monospace',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  messageContainer: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 2,
  },
  errorMessage: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
  },
  successMessage: {
    backgroundColor: colors.surface,
    borderColor: colors.success,
  },
  messageText: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  errorText: {
    color: colors.error,
  },
  successText: {
    color: colors.success,
  },
  button: {
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  dangerButton: {
    backgroundColor: colors.background,
    borderColor: colors.error,
    marginTop: spacing.md,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
});
