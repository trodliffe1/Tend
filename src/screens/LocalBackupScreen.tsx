import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { colors, spacing } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { importAllData } from '../database/database';
import { Person, AppSettings } from '../types';

interface BackupData {
  persons: Person[];
  settings: AppSettings;
}

function isValidBackupData(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.persons) && obj.settings !== undefined;
}

export default function LocalBackupScreen() {
  const { exportData, refreshData } = useApp();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportData = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const data = await exportData();
      await Share.share({
        message: data,
        title: 'Orbyt Backup',
      });
      setMessage({ type: 'success', text: 'Data exported successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    setMessage(null);

    Alert.alert(
      'Import Data',
      'This will replace all current data with the imported backup. This cannot be undone.\n\nMake sure you select a valid Orbyt backup file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select File',
          onPress: async () => {
            try {
              setLoading(true);

              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });

              if (result.canceled || !result.assets || result.assets.length === 0) {
                setLoading(false);
                return;
              }

              const file = result.assets[0];
              const content = await FileSystem.readAsStringAsync(file.uri);

              let data: unknown;
              try {
                data = JSON.parse(content);
              } catch {
                setMessage({ type: 'error', text: 'Invalid file format. Please select a valid JSON backup.' });
                setLoading(false);
                return;
              }

              if (!isValidBackupData(data)) {
                setMessage({ type: 'error', text: 'Invalid backup file. Missing required data.' });
                setLoading(false);
                return;
              }

              await importAllData(data);
              await refreshData();

              setMessage({ type: 'success', text: 'Data imported successfully' });
            } catch (error) {
              console.error('Import error:', error);
              setMessage({ type: 'error', text: 'Import failed. Please try again.' });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>LOCAL BACKUP</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Export your data as a JSON file to save locally or share.
            Import a previously exported backup to restore your data.
          </Text>
          <Text style={styles.warningText}>
            Keep your backup file safe. Anyone with access to it can see your data.
          </Text>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPORT</Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleExportData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>EXPORT DATA</Text>
                <Text style={styles.buttonHint}>Save as JSON file</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IMPORT</Text>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
            onPress={handleImportData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.secondaryButtonText}>IMPORT DATA</Text>
                <Text style={styles.buttonHintSecondary}>Restore from JSON file</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>TIPS</Text>
          <Text style={styles.tipText}>• Export regularly to keep a backup</Text>
          <Text style={styles.tipText}>• Save exports to cloud storage (iCloud, Google Drive)</Text>
          <Text style={styles.tipText}>• Email the file to yourself for safekeeping</Text>
          <Text style={styles.tipText}>• Import will replace ALL existing data</Text>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  button: {
    padding: spacing.md,
    alignItems: 'center',
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
  buttonHint: {
    fontSize: 11,
    color: colors.background,
    fontFamily: 'monospace',
    marginTop: spacing.xs,
    opacity: 0.8,
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
  buttonHintSecondary: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginTop: spacing.xs,
  },
  tipsCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  tipsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: 12,
    color: colors.textLight,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
