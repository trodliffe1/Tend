import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Button from '../components/Button';
import { colors, spacing } from '../constants/theme';
import {
  Borough,
  EventCategory,
  EventRow,
  CATEGORY_LABELS,
  SELECTABLE_CATEGORIES,
  fetchBoroughs,
  fetchRandomEvents,
} from '../lib/events';

type DatePreset = 'any' | 'today' | 'tomorrow' | 'weekend' | 'week' | 'custom';

const DATE_PRESETS: { key: Exclude<DatePreset, 'custom'>; label: string }[] = [
  { key: 'any', label: 'Any time' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'week', label: 'Next 7 days' },
];

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateRangeFor(
  preset: DatePreset,
  customDate: Date | null
): { startDate?: string; endDate?: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ymd = (offset: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return formatYMD(d);
  };

  switch (preset) {
    case 'any':
      return { startDate: ymd(0) };
    case 'today':
      return { startDate: ymd(0), endDate: ymd(0) };
    case 'tomorrow':
      return { startDate: ymd(1), endDate: ymd(1) };
    case 'week':
      return { startDate: ymd(0), endDate: ymd(7) };
    case 'weekend': {
      const dow = today.getDay();
      let satOffset: number;
      let sunOffset: number;
      if (dow === 0) {
        satOffset = 0;
        sunOffset = 0;
      } else if (dow === 6) {
        satOffset = 0;
        sunOffset = 1;
      } else {
        satOffset = 6 - dow;
        sunOffset = satOffset + 1;
      }
      return { startDate: ymd(satOffset), endDate: ymd(sunOffset) };
    }
    case 'custom': {
      if (!customDate) return { startDate: ymd(0) };
      const ymdStr = formatYMD(customDate);
      return { startDate: ymdStr, endDate: ymdStr };
    }
  }
}

function formatEventWhen(event: EventRow): string {
  try {
    const d = new Date(event.start_at);
    const dayLabel = d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeLabel = d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${dayLabel} • ${timeLabel}`;
  } catch {
    return event.event_date;
  }
}

function priceLabel(event: EventRow): string | null {
  if (event.is_free) return 'Free';
  if (event.price_min_gbp != null && event.price_max_gbp != null) {
    if (event.price_min_gbp === event.price_max_gbp) {
      return `£${event.price_min_gbp}`;
    }
    return `£${event.price_min_gbp}–£${event.price_max_gbp}`;
  }
  if (event.price_min_gbp != null) return `From £${event.price_min_gbp}`;
  return null;
}

function shortDateLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HangoutScreen() {
  const [boroughs, setBoroughs] = useState<Borough[]>([]);
  const [boroughsLoading, setBoroughsLoading] = useState(true);
  const [boroughPickerOpen, setBoroughPickerOpen] = useState(false);

  const [selectedBoroughs, setSelectedBoroughs] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [selectedDate, setSelectedDate] = useState<DatePreset>('any');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date>(new Date());

  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchBoroughs()
      .then(b => {
        if (mounted) setBoroughs(b);
      })
      .catch(() => {
        if (mounted) setBoroughs([]);
      })
      .finally(() => {
        if (mounted) setBoroughsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const boroughChipLabel = useMemo(() => {
    if (selectedBoroughs.length === 0) return 'Any borough';
    if (selectedBoroughs.length === 1) {
      return boroughs.find(b => b.slug === selectedBoroughs[0])?.name ?? selectedBoroughs[0];
    }
    return `${selectedBoroughs.length} boroughs`;
  }, [selectedBoroughs, boroughs]);

  const toggleBorough = (slug: string) => {
    setSelectedBoroughs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const toggleCategory = (cat: EventCategory) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const openDatePicker = () => {
    setPendingDate(customDate ?? new Date());
    setDatePickerOpen(true);
  };

  const handleDatePickerChange = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerOpen(false);
      if (event.type === 'set' && picked) {
        setCustomDate(picked);
        setSelectedDate('custom');
      }
    } else if (picked) {
      setPendingDate(picked);
    }
  };

  const handleDatePickerDone = () => {
    setCustomDate(pendingDate);
    setSelectedDate('custom');
    setDatePickerOpen(false);
  };

  const handleFind = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const range = dateRangeFor(selectedDate, customDate);
      const results = await fetchRandomEvents(
        {
          boroughs: selectedBoroughs,
          categories: selectedCategories,
          startDate: range.startDate,
          endDate: range.endDate,
        },
        3
      );
      setEvents(results);
    } catch (err) {
      setEvents([]);
      Alert.alert('Could not load events', 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const openEvent = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Cannot open link', 'The event URL could not be opened.');
    });
  };

  const customDateLabel = customDate ? shortDateLabel(customDate) : 'Pick date';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Find Something To Do</Text>
          <Text style={styles.subtitle}>
            Pick filters, then pull 3 random events from across London
          </Text>
        </View>

        {/* Borough */}
        <Text style={styles.filterLabel}>Boroughs</Text>
        <TouchableOpacity
          style={styles.boroughChip}
          onPress={() => setBoroughPickerOpen(true)}
          disabled={boroughsLoading}
        >
          <Text style={styles.boroughChipText}>
            {boroughsLoading ? 'Loading…' : boroughChipLabel}
          </Text>
          <Text style={styles.boroughChipCaret}>▾</Text>
        </TouchableOpacity>

        {/* Category */}
        <Text style={styles.filterLabel}>Event types</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          <Pill
            label="All"
            selected={selectedCategories.length === 0}
            onPress={() => setSelectedCategories([])}
          />
          {SELECTABLE_CATEGORIES.map(cat => (
            <Pill
              key={cat}
              label={CATEGORY_LABELS[cat]}
              selected={selectedCategories.includes(cat)}
              onPress={() => toggleCategory(cat)}
            />
          ))}
        </ScrollView>

        {/* Date */}
        <Text style={styles.filterLabel}>When</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {DATE_PRESETS.map(p => (
            <Pill
              key={p.key}
              label={p.label}
              selected={selectedDate === p.key}
              onPress={() => setSelectedDate(p.key)}
            />
          ))}
          <Pill
            label={customDateLabel}
            selected={selectedDate === 'custom'}
            onPress={openDatePicker}
          />
        </ScrollView>

        <View style={styles.findButtonContainer}>
          <Button
            title={loading ? 'Searching…' : hasSearched ? 'Try Again' : 'Find 3 Events'}
            onPress={handleFind}
            disabled={loading}
            size="large"
          />
        </View>

        {/* Results */}
        <View style={styles.results}>
          {loading && (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.centerStateText}>Scanning the void…</Text>
            </View>
          )}

          {!loading && hasSearched && events && events.length === 0 && (
            <View style={styles.centerState}>
              <Text style={styles.centerStateText}>No events match those filters.</Text>
              <Text style={styles.centerStateHint}>
                Try widening your borough, type, or date range.
              </Text>
            </View>
          )}

          {!loading &&
            events &&
            events.map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => openEvent(event.url)}
                activeOpacity={0.7}
              >
                <View style={styles.eventCategoryRow}>
                  <Text style={styles.eventCategoryText}>
                    {CATEGORY_LABELS[event.category] ?? event.category}
                  </Text>
                  {priceLabel(event) && (
                    <Text style={styles.eventPriceText}>{priceLabel(event)}</Text>
                  )}
                </View>

                <Text style={styles.eventTitle}>{event.title}</Text>

                <Text style={styles.eventWhen}>{formatEventWhen(event)}</Text>

                {(event.venue_name || event.borough) && (
                  <Text style={styles.eventVenue}>
                    {[
                      event.venue_name,
                      boroughs.find(b => b.slug === event.borough)?.name,
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </Text>
                )}

                {event.description && (
                  <Text style={styles.eventDescription} numberOfLines={3}>
                    {event.description}
                  </Text>
                )}

                <Text style={styles.eventLink}>Tap to open ▸</Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* Borough Picker Modal — multi-select */}
      <Modal
        visible={boroughPickerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setBoroughPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedBoroughs([])}>
                <Text style={styles.modalSecondaryAction}>Clear</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {selectedBoroughs.length === 0
                  ? 'Pick boroughs'
                  : `${selectedBoroughs.length} selected`}
              </Text>
              <TouchableOpacity onPress={() => setBoroughPickerOpen(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={boroughs}
              keyExtractor={item => item.slug}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              renderItem={({ item }) => {
                const isSelected = selectedBoroughs.includes(item.slug);
                return (
                  <TouchableOpacity
                    style={styles.modalRow}
                    onPress={() => toggleBorough(item.slug)}
                  >
                    <Text
                      style={[
                        styles.modalRowText,
                        isSelected && styles.modalRowTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && <Text style={styles.modalRowCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Date picker — Android renders inline, iOS in a modal */}
      {datePickerOpen && Platform.OS === 'android' && (
        <DateTimePicker
          value={customDate ?? new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={handleDatePickerChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          visible={datePickerOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setDatePickerOpen(false)}
        >
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setDatePickerOpen(false)}>
                  <Text style={styles.modalSecondaryAction}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDatePickerDone}>
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pendingDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={handleDatePickerChange}
                textColor={colors.primary}
                themeVariant="dark"
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected]}
      activeOpacity={0.7}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  boroughChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  boroughChipText: {
    color: colors.text,
    fontSize: 15,
    fontFamily: 'monospace',
  },
  boroughChipCaret: {
    color: colors.primary,
    fontSize: 16,
  },
  pillRow: {
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.xs,
  },
  pillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '22',
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillTextSelected: {
    color: colors.primary,
  },
  findButtonContainer: {
    marginTop: spacing.lg,
  },
  results: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  centerState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  centerStateText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  centerStateHint: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
  },
  eventCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  eventCategoryText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  eventPriceText: {
    color: colors.secondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  eventTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  eventWhen: {
    color: colors.primaryLight,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  eventVenue: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  eventDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  eventLink: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalDone: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  modalSecondaryAction: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modalRowText: {
    color: colors.text,
    fontSize: 15,
  },
  modalRowTextSelected: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  modalRowCheck: {
    color: colors.primary,
    fontSize: 16,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.3,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: colors.background,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingBottom: spacing.lg,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
