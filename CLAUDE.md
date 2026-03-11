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
- **Database**: expo-sqlite (local-first)
- **Authentication**: Supabase Auth with AsyncStorage session persistence
- **State Management**: React Context (AppContext for data, AuthContext for auth)
- **Notifications**: expo-notifications
- **Time Picker**: @react-native-community/datetimepicker (native time picker in Settings)
- **Theme**: Dark CRT terminal theme with green (#22CC22) primary color

## Project Structure
```
Tend/
├── App.tsx                 # Main entry - auth flow, navigation setup, tab bar config
├── .env                    # Supabase credentials (gitignored)
├── src/
│   ├── screens/
│   │   ├── auth/                   # Authentication screens
│   │   │   ├── LoginScreen.tsx     # Login with email/password
│   │   │   ├── RegisterScreen.tsx  # Registration with password requirements
│   │   │   └── ForgotPasswordScreen.tsx  # Password reset
│   │   ├── HomeScreen.tsx          # Dashboard ("MyOrbyt") showing all connections sorted by urgency
│   │   ├── PersonDetailScreen.tsx  # Individual person view with notes & interaction history
│   │   ├── AddEditPersonScreen.tsx # Modal for creating/editing people (with family details)
│   │   ├── HangoutScreen.tsx        # Random activity idea generator
│   │   ├── SettingsScreen.tsx      # Notification prefs (native time picker), date reminders, account & sign out
│   │   ├── BackupRestoreScreen.tsx # Encrypted cloud backup management
│   │   ├── LocalBackupScreen.tsx   # Local JSON export/import
│   │   └── PrivacyPolicyScreen.tsx # In-app privacy policy viewer
│   ├── components/         # Reusable UI components
│   │   ├── PersonCard.tsx          # Card displaying person with HealthBar
│   │   ├── HealthBar.tsx           # Vertical health bar indicator next to avatars
│   │   ├── StatusRing.tsx          # Circular progress indicator (legacy, replaced by HealthBar)
│   │   ├── Button.tsx              # Styled button component
│   │   ├── InteractionPicker.tsx   # Modal for logging interaction types
│   │   └── icons/index.tsx          # Custom SVG icon components
│   ├── context/
│   │   ├── AppContext.tsx          # Global state provider (persons, settings, CRUD ops)
│   │   └── AuthContext.tsx         # Auth state provider (user, session, signIn/signUp/signOut/resetPassword/deleteAccount)
│   ├── lib/
│   │   └── supabase.ts             # Supabase client configuration
│   ├── database/
│   │   └── database.ts             # SQLite operations (CRUD for persons, notes, interactions, family_members)
│   ├── types/
│   │   ├── index.ts                # TypeScript type definitions
│   │   └── auth.ts                 # Auth-related type definitions
│   ├── utils/
│   │   ├── helpers.ts              # Status calculations, date formatting, status percentage
│   │   ├── notifications.ts        # Notification scheduling & permissions (including date reminders)
│   │   ├── validation.ts           # Email/password validation, password strength checker
│   │   ├── authErrors.ts           # Maps Supabase errors to user-friendly messages
│   │   ├── encryption.ts           # AES encryption/decryption for cloud backup
│   │   └── backup.ts               # Cloud backup/restore orchestration
│   └── constants/
│       ├── theme.ts                # Dark CRT terminal theme colors, spacing, typography
│       └── activityIdeas.ts        # 40+ categorized activity ideas
├── supabase/
│   └── functions/
│       └── delete-user-account/  # Edge function for account deletion
├── landing-page/
│   ├── index.html          # Marketing landing page (myorbyt.com)
│   ├── delete-account.html # Account deletion page
│   └── privacy-policy.html # Privacy policy page
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
- `type`: text | call | in-person | hangout
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
- **Auth flow**: Unauthenticated users see AuthNavigator (Login → Register/ForgotPassword)
- **Main app**: Authenticated users see AppNavigator with bottom tabs
- Bottom tabs: Orbyt (home), Hangout, Settings
- Stack navigator for: PersonDetail (back button shows "Back To Orbyt"), AddEditPerson (modal), PrivacyPolicy
- Home screen title: "MyOrbyt"
- Note: Some in-app button labels still use "Orbit" (e.g., "Remove from Orbit", "Launch into Orbit")

### Authentication
- **Provider**: Supabase Auth with email/password
- **Session persistence**: AsyncStorage (survives app restarts)
- **Auth state**: Managed via AuthContext (user, session, loading, initialized)
- **Methods**: signIn, signUp, signOut, resetPassword, deleteAccount
- **Protected routes**: App content only accessible when authenticated
- **Password requirements**: 8+ chars, uppercase, lowercase, number
- **Sign out**: Available in Settings > Account section
- **Account deletion**: Settings > Account > Delete Account (double confirmation, calls Supabase Edge Function `delete-user-account`)

### Encrypted Cloud Backup
- **Location**: Settings > Your Data > Cloud Backup
- **Encryption**: AES-256-CBC with PBKDF2 key derivation (100k iterations)
- **Privacy**: Data encrypted client-side before upload; server only sees encrypted blob
- **Storage**: Supabase `user_backups` table (one backup per user, overwritten on update)
- **Recovery**: Requires backup password; cannot be recovered if password forgotten

### Local Backup
- **Location**: Settings > Your Data > Local Backup
- **Export**: Saves all data as JSON file via share sheet (email, cloud storage, etc.)
- **Import**: Reads JSON file via document picker, replaces all local data
- **Format**: Unencrypted JSON containing persons array and settings object

## Color Palette (CRT Terminal Theme)
```typescript
colors = {
  primary: '#22CC22',      // Terminal green
  primaryLight: '#33FF33',
  primaryDark: '#1A9A1A',
  secondary: '#FFAA00',    // Amber
  background: '#000000',   // Pure black
  surface: '#0A0A0A',
  surfaceElevated: '#111111',
  text: '#22CC22',         // Terminal green
  textSecondary: '#1A9A1A',
  textLight: '#117711',
  healthy: '#33FF33',      // Bright green
  dueSoon: '#FFAA00',      // Amber
  overdue: '#FF3333',      // Bright red
  error: '#FF3333',
  success: '#33FF33',
  border: '#1A9A1A',
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

### Version String
When bumping the version in `app.json`, also update:
- `src/screens/SettingsScreen.tsx` — hardcoded "Version x.x.x" in the About card

### Date Input Format
All date fields (birthday, anniversary) use MM/DD format with auto-formatting as user types.

### Expo Plugins & Permissions
- `expo-contacts` with `READ_CONTACTS` permission — used for contact import on AddEditPerson screen
- `expo-calendar` with `READ_CALENDAR`/`WRITE_CALENDAR` permissions — used for "Book It" feature on Hangout screen
- `@react-native-community/datetimepicker` — native time picker for notification time settings

### Notifications (iOS & Android)
- **iOS permissions**: Must request with explicit `ios: { allowAlert, allowBadge, allowSound }` options
- **Sound**: Use `sound: 'default'` (string), not `sound: true` (boolean) — iOS requires the string form
- **Scheduling**: Notifications are scheduled as one-shot DATE triggers for the next 7 days (skipping quiet days). The app reschedules whenever `persons` or `settings` change. If the user doesn't open the app for 7+ days, notifications will stop until next open.
- **Android**: Uses a `reminders` notification channel with HIGH importance
- **Time picker**: Settings screen uses `@react-native-community/datetimepicker` for minute-level precision (replaces old Alert-based hourly picker)

### Supabase Auth
- User data stored in `auth.users` (protected schema, view in Dashboard > Authentication > Users)
- Session tokens auto-refresh via Supabase client config
- `detectSessionInUrl: false` required for React Native (no browser redirects)

### Supabase Tables
- `user_backups` - Encrypted backup blobs (one per user, RLS-protected)
  - Columns: id, user_id, encrypted_data, salt, iv, version, created_at, updated_at

## Environment Variables
Create a `.env` file in the Tend directory (gitignored):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project: Settings > API

## Running the App
```bash
npm install
npx expo start
# Press 'a' for Android, 'i' for iOS, or scan QR with Expo Go
```

**First-time setup**: Ensure Supabase project has Email auth enabled (Authentication > Providers > Email).

## Common Tasks
- **Register**: Launch app > Register link > fill email/password > verify email
- **Sign in**: Launch app > enter credentials > "Establish Connection"
- **Sign out**: Settings > Account > Sign Out
- **Cloud backup**: Settings > Your Data > Cloud Backup > enter password > Create Backup
- **Cloud restore**: Settings > Your Data > Cloud Backup > enter password > Restore from Backup
- **Local export**: Settings > Your Data > Local Backup > Export Data
- **Local import**: Settings > Your Data > Local Backup > Import Data > select JSON file
- **Add a person**: Tap + FAB on Orbit screen → "Launch into Orbit"
- **Add family details**: When adding/editing a person, scroll down to add spouse and kids with birthdays
- **Log contact**: Tap "Log Contact" on person card or detail screen
- **Add context note**: Person detail > Notes section > + Add
- **Get activity idea**: Hangout tab > tap "Get an Idea"
- **Remove person**: Person detail > "Remove from Orbit"
- **Delete account**: Settings > Account > Delete Account (double confirmation, calls Supabase Edge Function)
- **Import from contacts**: When adding a person, tap "Import from Contacts" (uses expo-contacts)
- **Book activity to calendar**: Hangout tab > get idea > "Book It" (books to next Saturday 7 PM via expo-calendar)
- **View privacy policy**: Settings > About > Privacy Policy
- **Configure date reminders**: Settings > Birthday & Anniversary Reminders section
