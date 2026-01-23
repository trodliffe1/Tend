import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import PersonCard from '../components/PersonCard';
import InteractionPicker from '../components/InteractionPicker';
import { sortByUrgency, getHealthStatus } from '../utils/helpers';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Person, InteractionType, HealthStatus } from '../types';

type RootStackParamList = {
  MainTabs: undefined;
  PersonDetail: { personId: string };
  AddEditPerson: { personId?: string };
};

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { persons, loading, refreshPersons, logInteraction } = useApp();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sortedPersons = useMemo(() => sortByUrgency(persons), [persons]);

  const stats = useMemo(() => {
    const counts: Record<HealthStatus, number> = {
      healthy: 0,
      'due-soon': 0,
      overdue: 0,
    };
    persons.forEach(p => {
      const status = getHealthStatus(p);
      counts[status]++;
    });
    return counts;
  }, [persons]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPersons();
    setRefreshing(false);
  };

  const handleQuickLog = (person: Person) => {
    setSelectedPerson(person);
    setPickerVisible(true);
  };

  const handleInteractionSelect = async (type: InteractionType) => {
    if (selectedPerson) {
      await logInteraction(selectedPerson.id, type);
      setSelectedPerson(null);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🛰️</Text>
      <Text style={styles.emptyTitle}>Launch Your First Connection</Text>
      <Text style={styles.emptySubtitle}>
        Add the people who matter to you and we'll help you keep them in orbit
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddEditPerson', {})}
      >
        <Text style={styles.addButtonText}>Add Someone</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.greeting}>My Orbit</Text>
      {persons.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={[styles.statBadge, { backgroundColor: colors.overdue + '20' }]}>
            <Text style={[styles.statNumber, { color: colors.overdue }]}>{stats.overdue}</Text>
            <Text style={styles.statLabel}>Need attention</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.dueSoon + '20' }]}>
            <Text style={[styles.statNumber, { color: colors.dueSoon }]}>{stats['due-soon']}</Text>
            <Text style={styles.statLabel}>Due soon</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.healthy + '20' }]}>
            <Text style={[styles.statNumber, { color: colors.healthy }]}>{stats.healthy}</Text>
            <Text style={styles.statLabel}>Strong Signal</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      {persons.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sortedPersons}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PersonCard
              person={item}
              onPress={() => navigation.navigate('PersonDetail', { personId: item.id })}
              onQuickLog={() => handleQuickLog(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditPerson', {})}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <InteractionPicker
        visible={pickerVisible}
        onClose={() => {
          setPickerVisible(false);
          setSelectedPerson(null);
        }}
        onSelect={handleInteractionSelect}
        showDateNight={selectedPerson?.relationshipType === 'partner'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBadge: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  addButton: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 0,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  fabText: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '400',
    fontFamily: 'monospace',
  },
});
