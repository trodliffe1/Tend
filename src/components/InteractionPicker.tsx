import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { InteractionType, INTERACTION_LABELS } from '../types';
import { colors, spacing, borderRadius } from '../constants/theme';

interface InteractionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: InteractionType) => void;
  showDateNight?: boolean;
}

const interactionOptions: { type: InteractionType; emoji: string }[] = [
  { type: 'text', emoji: '💬' },
  { type: 'call', emoji: '📞' },
  { type: 'in-person', emoji: '🤝' },
  { type: 'date-night', emoji: '💑' },
];

export default function InteractionPicker({
  visible,
  onClose,
  onSelect,
  showDateNight = false,
}: InteractionPickerProps) {
  const options = showDateNight
    ? interactionOptions
    : interactionOptions.filter(o => o.type !== 'date-night');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container}>
          <Text style={styles.title}>How did you connect?</Text>
          <View style={styles.optionsContainer}>
            {options.map(option => (
              <TouchableOpacity
                key={option.type}
                style={styles.option}
                onPress={() => {
                  onSelect(option.type);
                  onClose();
                }}
              >
                <Text style={styles.emoji}>{option.emoji}</Text>
                <Text style={styles.label}>{INTERACTION_LABELS[option.type]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  option: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    width: '45%',
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
