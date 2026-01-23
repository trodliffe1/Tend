import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import InteractionPicker from '../components/InteractionPicker';
import { colors, spacing, borderRadius } from '../constants/theme';
import {
  Person,
  InteractionType,
  RELATIONSHIP_LABELS,
  FREQUENCY_LABELS,
  INTERACTION_LABELS,
} from '../types';
import {
  getHealthStatus,
  getHealthColor,
  getStatusPercentage,
  formatDate,
  formatRelativeDate,
  generateId,
} from '../utils/helpers';
import HealthBar from '../components/HealthBar';

type RootStackParamList = {
  MainTabs: undefined;
  PersonDetail: { personId: string };
  AddEditPerson: { personId?: string };
};

type PersonDetailRouteProp = RouteProp<RootStackParamList, 'PersonDetail'>;

export default function PersonDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PersonDetailRouteProp>();
  const { persons, logInteraction, addNote, deleteNote, deletePerson } = useApp();

  const [person, setPerson] = useState<Person | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  useEffect(() => {
    const found = persons.find(p => p.id === route.params.personId);
    setPerson(found || null);
  }, [persons, route.params.personId]);

  if (!person) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Person not found</Text>
      </SafeAreaView>
    );
  }

  const status = getHealthStatus(person);
  const statusColor = getHealthColor(status);
  const percentage = getStatusPercentage(person);

  const handleInteractionSelect = async (type: InteractionType) => {
    await logInteraction(person.id, type);
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await addNote(person.id, newNote.trim());
      setNewNote('');
      setShowNoteInput(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteNote(noteId, person.id),
      },
    ]);
  };

  const handleDeletePerson = () => {
    Alert.alert(
      'Remove Person',
      `Are you sure you want to remove ${person.name} from your orbit?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deletePerson(person.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getInteractionEmoji = (type: InteractionType): string => {
    const emojis: Record<InteractionType, string> = {
      text: '💬',
      call: '📞',
      'in-person': '🤝',
      'date-night': '💑',
    };
    return emojis[type];
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            {person.photo ? (
              <Image source={{ uri: person.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: statusColor + '30' }]}>
                <Text style={styles.avatarText}>{person.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <HealthBar status={status} percentage={percentage} height={96} width={8} />
          </View>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.relationship}>{RELATIONSHIP_LABELS[person.relationshipType]}</Text>
          <View style={[styles.frequencyBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.frequencyText, { color: statusColor }]}>
              {FREQUENCY_LABELS[person.frequency]}
            </Text>
          </View>
        </View>

        {/* Log Interaction Button */}
        <View style={styles.section}>
          <Button
            title="Log Contact"
            onPress={() => setPickerVisible(true)}
            size="large"
          />
        </View>

        {/* Important Dates */}
        {(person.birthday || person.anniversary) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Dates</Text>
            <View style={styles.infoCard}>
              {person.birthday && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🎂 Birthday</Text>
                  <Text style={styles.infoValue}>{person.birthday}</Text>
                </View>
              )}
              {person.anniversary && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>💍 Anniversary</Text>
                  <Text style={styles.infoValue}>{person.anniversary}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Spouse */}
        {person.spouse && person.spouse.name && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spouse / Partner</Text>
            <View style={styles.familyCard}>
              <Text style={styles.familyName}>{person.spouse.name}</Text>
              {person.spouse.birthday && (
                <Text style={styles.familyDetail}>🎂 {person.spouse.birthday}</Text>
              )}
              {person.spouse.info && (
                <Text style={styles.familyInfo}>{person.spouse.info}</Text>
              )}
            </View>
          </View>
        )}

        {/* Kids */}
        {person.kids && person.kids.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kids</Text>
            {person.kids.map((kid) => (
              <View key={kid.id} style={styles.familyCard}>
                <Text style={styles.familyName}>{kid.name}</Text>
                {kid.birthday && (
                  <Text style={styles.familyDetail}>🎂 {kid.birthday}</Text>
                )}
                {kid.info && (
                  <Text style={styles.familyInfo}>{kid.info}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes & Context</Text>
            <TouchableOpacity onPress={() => setShowNoteInput(!showNoteInput)}>
              <Text style={styles.addLink}>{showNoteInput ? 'Cancel' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>

          {showNoteInput && (
            <View style={styles.noteInputContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="e.g., Ask about the job interview..."
                placeholderTextColor={colors.textLight}
                value={newNote}
                onChangeText={setNewNote}
                multiline
              />
              <Button title="Save" onPress={handleAddNote} size="small" disabled={!newNote.trim()} />
            </View>
          )}

          {person.notes.length === 0 ? (
            <Text style={styles.emptyText}>
              Add notes to remember what to ask about next time
            </Text>
          ) : (
            person.notes.map(note => (
              <TouchableOpacity
                key={note.id}
                style={styles.noteCard}
                onLongPress={() => handleDeleteNote(note.id)}
              >
                <Text style={styles.noteContent}>{note.content}</Text>
                <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Interaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interaction History</Text>
          {person.interactions.length === 0 ? (
            <Text style={styles.emptyText}>No interactions logged yet</Text>
          ) : (
            person.interactions.slice(0, 10).map(interaction => (
              <View key={interaction.id} style={styles.interactionItem}>
                <Text style={styles.interactionEmoji}>{getInteractionEmoji(interaction.type)}</Text>
                <View style={styles.interactionInfo}>
                  <Text style={styles.interactionType}>{INTERACTION_LABELS[interaction.type]}</Text>
                  <Text style={styles.interactionDate}>{formatRelativeDate(interaction.date)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('AddEditPerson', { personId: person.id })}
          >
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePerson}>
            <Text style={styles.deleteButtonText}>Remove from Orbit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <InteractionPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleInteractionSelect}
        showDateNight={person.relationshipType === 'partner'}
      />
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
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  relationship: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontFamily: 'monospace',
  },
  frequencyBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  noteInputContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  noteInput: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    fontSize: 14,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: colors.border,
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  noteCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  noteContent: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  noteDate: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: spacing.xs,
    fontFamily: 'monospace',
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  interactionEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  interactionInfo: {
    flex: 1,
  },
  interactionType: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  interactionDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  editButton: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
  },
  deleteButtonText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  infoValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  familyCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  familyName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  familyDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
  familyInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
});
