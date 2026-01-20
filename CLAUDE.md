# Orbyt - Relationship Tracker

## Purpose
Orbyt is a mobile app that helps users maintain meaningful connections with friends, family, and partners. It works like a "fitness tracker for relationships"—tracking contact frequency, sending gentle reminders, and helping users keep their important connections in orbit.

**Target Audience:**
- **New parents** feeling isolated from their friend groups
- **Introverts** who struggle with initiating and maintaining contact
- **People with ADHD** who struggle with "out of sight, out of mind" communication patterns

**Tone:** Tongue-in-cheek space metaphors highlighting human connection "in the void of nothingness." Focus on mental health benefits without guilt or pressure.

## Tech Stack
- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Language**: TypeScript 5.9.2 (strict mode)
- **Navigation**: React Navigation 7.x (bottom tabs + native stack)
- **Database**: expo-sqlite (local-first, no backend)
- **State Management**: React Context
- **Notifications**: expo-notifications
- **Theme**: Dark mode with cosmic purple (#8B5CF6) primary color

## Project Structure
```
Tend/
├── App.tsx                 # Main entry - navigation setup, tab bar configuration
├── src/
│   ├── screens/            # Main app screens
│   │   ├── HomeScreen.tsx          # Dashboard ("My Orbit") showing all connections sorted by urgency
│   │   ├── PersonDetailScreen.tsx  # Individual person view with notes & interaction history
│   │   ├── AddEditPersonScreen.tsx # Modal for creating/editing people (with family details)
│   │   ├── DateNightScreen.tsx     # Random date idea generator
│   │   └── SettingsScreen.tsx      # Notification prefs, date reminders & data export
│   ├── components/         # Reusable UI components
│   │   ├── PersonCard.tsx          # Card displaying person with HealthBar
│   │   ├── HealthBar.tsx           # Vertical health bar indicator next to avatars
│   │   ├── StatusRing.tsx          # Circular progress indicator (legacy, replaced by HealthBar)
│   │   ├── Button.tsx              # Styled button component
│   │   └── InteractionPicker.tsx   # Modal for logging interaction types
│   ├── context/
│   │   └── AppContext.tsx          # Global state provider (persons, settings, CRUD ops)
│   ├── database/
│   │   └── database.ts             # SQLite operations (CRUD for persons, notes, interactions, family_members)
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── utils/
│   │   ├── helpers.ts              # Status calculations, date formatting, status percentage
│   │   └── notifications.ts        # Notification scheduling & permissions (including date reminders)
│   └── constants/
│       ├── theme.ts                # Dark space theme colors, spacing, typography
│       └── dateIdeas.ts            # 40+ categorized date night ideas
├── landing-page/
│   └── index.html          # Marketing landing page (myorbyt.com)
├── app.json                # Expo configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## Key Concepts

### Signal Status (Space Metaphor)
Connections are tracked using a space/satellite metaphor with visual health bars:
- 📡 **Strong Signal** (green, full bar) - Recently contacted within target frequency
- 🌙 **Fading** (amber, partial bar) - Approaching contact deadline (80% of frequency elapsed)
- 🌑 **Lost Contact** (red, empty bar) - Past the target contact frequency

### HealthBar Component
The `HealthBar` component displays a vertical bar next to avatars:
- Bar color reflects health status (green/amber/red)
- Bar fill percentage shows time remaining until due (fills from bottom)
- Healthy = full bar, Overdue = empty/faded bar
- Used in both `PersonCard` and `PersonDetailScreen`

### Data Model

**Person:**
- `id`, `name`, `photo`
- `relationshipType`: friend | family | partner | other
- `frequency`: daily | weekly | fortnightly | monthly | quarterly
- `lastContactDate`
- `birthday`: string (MM/DD format)
- `anniversary`: string (MM/DD format)
- `spouse`: FamilyMember (optional)
- `kids`: FamilyMember[]
- `notes`: Note[]
- `interactions`: Interaction[]
- `createdAt`

**FamilyMember:**
- `id`, `name`
- `birthday`: string (MM/DD format, optional)
- `info`: string (free-form notes, optional)

**Interaction:**
- `id`
- `type`: text | call | in-person | date-night
- `date`
- `note` (optional)

**Note:**
- `id`, `content`, `createdAt`
- Context reminders (e.g., "ask about job interview")

### Settings

**NotificationSettings:**
- `enabled`: boolean
- `quietHoursStart`, `quietHoursEnd`: string (HH:MM)
- `preferredTime`: string (HH:MM)
- `quietDays`: number[] (0=Sunday, 6=Saturday)

**DateReminderSettings:**
- `earlyWarningEnabled`: boolean
- `earlyWarningDays`: number (days before to notify)
- `onTheDayEnabled`: boolean

### Navigation
- Bottom tabs: Orbit (home), Date Night, Settings
- Stack navigator for: PersonDetail (back button shows "Back To Orbit"), AddEditPerson (modal)
- Home screen title: "My Orbit"

## Color Palette (Dark Space Theme)
```typescript
colors = {
  primary: '#8B5CF6',      // Cosmic purple
  primaryLight: '#A78BFA',
  primaryDark: '#6D28D9',
  secondary: '#E0E7FF',    // Stardust
  background: '#0F0B1A',   // Deep space
  surface: '#1A1625',
  surfaceElevated: '#252136',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  healthy: '#10B981',      // Emerald
  dueSoon: '#FBBF24',      // Amber
  overdue: '#EF4444',      // Red
}
```

## Database Tables
- `persons` - Main person records with birthday/anniversary fields
- `family_members` - Spouse and kids (linked to person via personId, memberType='spouse'|'kid')
- `notes` - Context notes for persons
- `interactions` - Contact history
- `settings` - App settings including date reminder preferences

## Important Notes

### Package Versions
Expo SDK 54 requires specific package versions. Always run `npx expo install --check` to verify compatibility. Key packages:
- react-native-screens@4.16.0 (NOT 4.19.0)
- react-native-gesture-handler@2.28.0

### New Architecture
Expo Go always uses React Native's new architecture. The app.json setting `newArchEnabled` only affects production builds.

### Entry Point
`import 'react-native-gesture-handler'` must be the first import in App.tsx.

### Date Input Format
All date fields (birthday, anniversary) use MM/DD format with auto-formatting as user types.

## Running the App
```bash
npm install
npx expo start
# Press 'a' for Android, 'i' for iOS, or scan QR with Expo Go
```

## Common Tasks
- **Add a person**: Tap + FAB on Orbit screen → "Launch into Orbit"
- **Add family details**: When adding/editing a person, scroll down to add spouse and kids with birthdays
- **Log contact**: Tap "Log Contact" on person card or detail screen
- **Add context note**: Person detail > Notes section > + Add
- **Get date idea**: Date Night tab > tap "Get an Idea"
- **Remove person**: Person detail > "Remove from Orbit"
- **Configure date reminders**: Settings > Birthday & Anniversary Reminders section
