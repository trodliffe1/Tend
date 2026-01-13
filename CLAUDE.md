# Tend - Relationship Health Tracker

## Purpose
Tend is a mobile app that helps users maintain meaningful connections with friends, family, and partners. It works like a "fitness tracker for relationships" - tracking contact frequency, sending gentle reminders, and helping users nurture their important relationships.

## Tech Stack
- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Language**: TypeScript 5.9.2 (strict mode)
- **Navigation**: React Navigation 7.x (bottom tabs + native stack)
- **Database**: expo-sqlite (local-first, no backend)
- **State Management**: React Context
- **Notifications**: expo-notifications

## Project Structure
```
Tend/
├── App.tsx                 # Main entry - navigation setup, tab bar configuration
├── src/
│   ├── screens/            # Main app screens
│   │   ├── HomeScreen.tsx          # Dashboard showing all relationships sorted by urgency
│   │   ├── PersonDetailScreen.tsx  # Individual person view with notes & interaction history
│   │   ├── AddEditPersonScreen.tsx # Modal for creating/editing people
│   │   ├── DateNightScreen.tsx     # Random date idea generator
│   │   └── SettingsScreen.tsx      # Notification prefs & data export
│   ├── components/         # Reusable UI components
│   │   ├── PersonCard.tsx          # Card displaying person with health status
│   │   ├── Button.tsx              # Styled button component
│   │   └── InteractionPicker.tsx   # Modal for logging interaction types
│   ├── context/
│   │   └── AppContext.tsx          # Global state provider (persons, settings, CRUD ops)
│   ├── database/
│   │   └── database.ts             # SQLite operations (CRUD for persons, notes, interactions)
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── utils/
│   │   ├── helpers.ts              # Health status calculations, date formatting
│   │   └── notifications.ts        # Notification scheduling & permissions
│   └── constants/
│       ├── theme.ts                # Colors, spacing, typography
│       └── dateIdeas.ts            # 40+ categorized date night ideas
├── app.json                # Expo configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## Key Concepts

### Health Status
Relationships are tracked using a plant metaphor:
- 🌿 **Healthy** - Recently contacted within target frequency
- 🌱 **Due Soon** - Approaching contact deadline (80% of frequency)
- 🥀 **Overdue** - Past the target contact frequency

### Data Model
- **Person**: name, photo, relationshipType (friend|family|partner|other), frequency (daily|weekly|fortnightly|monthly|quarterly), lastContactDate, notes[], interactions[]
- **Interaction**: type (text|call|in-person|date-night), date, optional note
- **Note**: Context reminders (e.g., "ask about job interview")

### Navigation
- Bottom tabs: Garden (home), Date Night, Settings
- Stack navigator for: PersonDetail, AddEditPerson (modal)

## Important Notes

### Package Versions
Expo SDK 54 requires specific package versions. Always run `npx expo install --check` to verify compatibility. Key packages:
- react-native-screens@4.16.0 (NOT 4.19.0)
- react-native-gesture-handler@2.28.0

### New Architecture
Expo Go always uses React Native's new architecture. The app.json setting `newArchEnabled` only affects production builds.

### Entry Point
`import 'react-native-gesture-handler'` must be the first import in App.tsx.

## Running the App
```bash
npm install
npx expo start
# Press 'a' for Android, 'i' for iOS, or scan QR with Expo Go
```

## Common Tasks
- **Add a person**: Tap + FAB on Home screen
- **Log interaction**: Tap "Log Contact" on person card or detail screen
- **Add context note**: Person detail > Notes section > + Add
- **Get date idea**: Date Night tab > tap "Get an Idea"
