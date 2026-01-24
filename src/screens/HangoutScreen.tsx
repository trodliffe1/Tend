import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Calendar from 'expo-calendar';
import { ActivityIdea, activityIdeas, categoryLabels, getRandomActivity } from '../constants/activityIdeas';
import Button from '../components/Button';
import {
  DiceIcon,
  HouseIcon,
  CityIcon,
  MountainIcon,
  LightningIcon,
  CoupleIcon,
  CalendarIcon,
} from '../components/icons';
import { colors, spacing, borderRadius } from '../constants/theme';

type Category = ActivityIdea['category'] | 'all';

const getCategoryIcon = (category: Category, size: number = 20, color: string = colors.textSecondary) => {
  switch (category) {
    case 'all':
      return <DiceIcon size={size} color={color} />;
    case 'home':
      return <HouseIcon size={size} color={color} />;
    case 'going-out':
      return <CityIcon size={size} color={color} />;
    case 'adventure':
      return <MountainIcon size={size} color={color} />;
    case 'quick':
      return <LightningIcon size={size} color={color} />;
    default:
      return <DiceIcon size={size} color={color} />;
  }
};

export default function HangoutScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [currentIdea, setCurrentIdea] = useState<ActivityIdea | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleSpin = () => {
    setIsSpinning(true);

    // Animate through a few random ideas before settling
    let count = 0;
    const interval = setInterval(() => {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      setCurrentIdea(getRandomActivity(category));
      count++;
      if (count >= 8) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  const handleBookIt = async () => {
    if (!currentIdea) return;

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Calendar Access',
        'To add this to your calendar, please allow calendar access in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(
        cal => cal.allowsModifications && cal.source.name === 'Default'
      ) || calendars.find(cal => cal.allowsModifications);

      if (!defaultCalendar) {
        Alert.alert('No Calendar', 'Could not find a calendar to add the event to.');
        return;
      }

      // Schedule for next Saturday at 7 PM
      const eventDate = new Date();
      const daysUntilSaturday = (6 - eventDate.getDay() + 7) % 7 || 7;
      eventDate.setDate(eventDate.getDate() + daysUntilSaturday);
      eventDate.setHours(19, 0, 0, 0);

      const endDate = new Date(eventDate);
      endDate.setHours(21, 0, 0, 0);

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Hangout: ${currentIdea.title}`,
        notes: currentIdea.description,
        startDate: eventDate,
        endDate: endDate,
        timeZone: 'local',
      });

      Alert.alert(
        'Booked!',
        `"${currentIdea.title}" has been added to your calendar for next Saturday at 7 PM.`
      );
    } catch (error) {
      Alert.alert('Error', 'Could not create calendar event. Please try again.');
    }
  };

  const categories: Category[] = ['all', 'home', 'going-out', 'adventure', 'quick'];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Activity Generator</Text>
          <Text style={styles.subtitle}>
            Shake things up with a random activity idea
          </Text>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <View style={styles.categoryIconContainer}>
                {getCategoryIcon(
                  category,
                  20,
                  selectedCategory === category ? colors.primary : colors.textSecondary
                )}
              </View>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextSelected,
                ]}
              >
                {category === 'all' ? 'All' : categoryLabels[category]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Idea Display */}
        <View style={styles.ideaContainer}>
          {currentIdea ? (
            <View style={[styles.ideaCard, isSpinning && styles.ideaCardSpinning]}>
              <View style={styles.ideaCategoryBadge}>
                {getCategoryIcon(currentIdea.category, 16, colors.textSecondary)}
                <Text style={styles.ideaCategoryText}>{categoryLabels[currentIdea.category]}</Text>
              </View>
              <Text style={styles.ideaTitle}>{currentIdea.title}</Text>
              <Text style={styles.ideaDescription}>{currentIdea.description}</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <CoupleIcon size={64} color={colors.primary} />
              </View>
              <Text style={styles.emptyText}>
                Tap the button below to get an activity idea!
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={isSpinning ? 'Spinning...' : currentIdea ? 'Spin Again' : 'Get an Idea'}
            onPress={handleSpin}
            disabled={isSpinning}
            size="large"
          />

          {currentIdea && !isSpinning && (
            <View style={styles.bookButtonContainer}>
              <Button
                title="Book It"
                onPress={handleBookIt}
                variant="outline"
                size="large"
                style={styles.bookButton}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
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
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  categoryButton: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    flex: 1,
    marginHorizontal: 2,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary + '20',
  },
  categoryIconContainer: {
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: colors.primary,
  },
  ideaContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  ideaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  ideaCardSpinning: {
    opacity: 0.7,
  },
  ideaCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ideaCategoryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ideaTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  ideaDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  bookButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButton: {
    marginTop: spacing.sm,
    flex: 1,
  },
});
