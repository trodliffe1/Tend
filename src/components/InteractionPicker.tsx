import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { InteractionType, INTERACTION_LABELS } from '../types';
import { ChatIcon, PhoneIcon, HandshakeIcon, CalendarIcon } from './icons';
import { colors, spacing, borderRadius } from '../constants/theme';

interface InteractionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: InteractionType) => void;
}

const getInteractionIcon = (type: InteractionType) => {
  const iconSize = 28;
  const iconColor = colors.primary;
  switch (type) {
    case 'text':
      return <ChatIcon size={iconSize} color={iconColor} />;
    case 'call':
      return <PhoneIcon size={iconSize} color={iconColor} />;
    case 'in-person':
      return <HandshakeIcon size={iconSize} color={iconColor} />;
    case 'hangout':
      return <CalendarIcon size={iconSize} color={iconColor} />;
    default:
      return <ChatIcon size={iconSize} color={iconColor} />;
  }
};

const interactionTypes: InteractionType[] = ['text', 'call', 'in-person', 'hangout'];

export default function InteractionPicker({
  visible,
  onClose,
  onSelect,
}: InteractionPickerProps) {
  const options = interactionTypes;

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
            {options.map(type => (
              <TouchableOpacity
                key={type}
                style={styles.option}
                onPress={() => {
                  onSelect(type);
                  onClose();
                }}
              >
                <View style={styles.iconContainer}>
                  {getInteractionIcon(type)}
                </View>
                <Text style={styles.label}>{INTERACTION_LABELS[type]}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 0,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 340,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    borderRadius: 0,
    width: '45%',
    borderWidth: 2,
    borderColor: colors.border,
  },
  iconContainer: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  cancelButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  cancelText: {
    fontSize: 12,
    color: colors.secondary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
});
