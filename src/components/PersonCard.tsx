import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Person, RELATIONSHIP_LABELS } from '../types';
import { getHealthStatus, getHealthColor, formatRelativeDate, getDaysUntilDue, getStatusPercentage } from '../utils/helpers';
import { colors, spacing, borderRadius } from '../constants/theme';
import HealthBar from './HealthBar';

interface PersonCardProps {
  person: Person;
  onPress: () => void;
  onQuickLog: () => void;
}

export default function PersonCard({ person, onPress, onQuickLog }: PersonCardProps) {
  const status = getHealthStatus(person);
  const statusColor = getHealthColor(status);
  const percentage = getStatusPercentage(person);
  const daysUntilDue = getDaysUntilDue(person);

  const getStatusText = () => {
    if (daysUntilDue < 0) {
      return `${Math.abs(daysUntilDue)} days overdue`;
    } else if (daysUntilDue === 0) {
      return 'Due today';
    } else {
      return `${daysUntilDue} days until due`;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            {person.photo ? (
              <Image source={{ uri: person.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: statusColor + '30' }]}>
                <Text style={styles.avatarText}>{person.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <HealthBar status={status} percentage={percentage} height={48} width={6} />
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.relationship}>{RELATIONSHIP_LABELS[person.relationshipType]}</Text>
          </View>
        </View>

        <Text style={[styles.statusText, { color: statusColor }]}>{getStatusText()}</Text>

        {person.lastContactDate && (
          <Text style={styles.lastContact}>Last contact: {formatRelativeDate(person.lastContactDate)}</Text>
        )}

        {status !== 'healthy' && person.notes.length > 0 && (
          <View style={styles.noteHint}>
            <Text style={styles.noteHintText} numberOfLines={1}>
              Ask about: {person.notes[0].content}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.quickLogButton, { borderColor: statusColor }]}
          onPress={(e) => {
            e.stopPropagation();
            onQuickLog();
          }}
        >
          <Text style={[styles.quickLogText, { color: statusColor }]}>Log Contact</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    gap: spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  relationship: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  lastContact: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  noteHint: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  noteHintText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  quickLogButton: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  quickLogText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
