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
- **Authentication**: Supabase Auth (email/password + native Google Sign-In) with AsyncStorage session persistence
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
│   │   ├── AddEditPersonScreen.tsx # Modal for creating/editing people (with family details & bulk contact import)
│   │   ├── HangoutScreen.tsx        # London events finder — borough/type/date filters → 3 random events from Supabase
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
│   │   └── icons/index.tsx          # Custom SVG icon components (incl. GoogleGIcon — official multicolor Google "G" logo)
│   ├── context/
│   │   ├── AppContext.tsx          # Global state provider (persons, settings, CRUD ops, notification scheduling)
│   │   └── AuthContext.tsx         # Auth state provider (user, session, signIn/signUp/signOut/resetPassword/deleteAccount)
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client configuration
│   │   ├── googleAuth.ts           # configureGoogleSignIn() — native Google Sign-In SDK setup (reads client IDs from .env)
│   │   └── events.ts               # EventHub events/boroughs queries (filtered random fetch w/ diversity)
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
│       └── theme.ts                # Dark CRT terminal theme colors, spacing, typography
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
- **Provider**: Supabase Auth with email/password, **native Google Sign-In, and Sign in with Apple (iOS)**
- **Session persistence**: AsyncStorage (survives app restarts)
- **Auth state**: Managed via AuthContext (user, session, loading, initialized)
- **Methods**: signIn, signUp, signInWithGoogle, signInWithApple, signOut, resetPassword, deleteAccount
- **Protected routes**: App content only accessible when authenticated
- **Password requirements**: 8+ chars, uppercase, lowercase, number
- **Sign out**: Available in Settings > Account section (also calls `GoogleSignin.signOut()` to clear any cached Google session)
- **Account deletion**: Settings > Account > Delete Account (double confirmation, calls Supabase Edge Function `delete-user-account`)

#### Google Sign-In (native)
- **Library**: `@react-native-google-signin/google-signin` — native account picker, NOT the OAuth web flow.
- **Flow**: native picker → ID token → `supabase.auth.signInWithIdToken({ provider: 'google', token })`. The resulting session flows through the existing `onAuthStateChange` listener, so no downstream app changes were needed.
- **Config**: `src/lib/googleAuth.ts` exposes `configureGoogleSignIn()`, called once on startup in `AuthContext`'s init `useEffect`. Reads client IDs from `.env` (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`).
- **UI**: official-style black "Continue with Google" button — black bg, multicolor `GoogleGIcon` logo, white system-font label, subtle gray border (`#5F6368`) so it reads on the pure-black background. With an "OR" divider, on both `LoginScreen` and `RegisterScreen`. Deliberately NOT CRT-green so it sits consistently next to the Apple button (see below).
- **app.json**: `@react-native-google-signin/google-signin` config plugin with the iOS reversed-client-ID `iosUrlScheme`.
- **Requires a dev build** — the native module does NOT run in Expo Go. Use `eas build --profile development` (needs `expo-dev-client`), then `npx expo start --dev-client`.
- **OAuth client IDs (Google Cloud Console)**:
  - **Web** client → used as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and pasted into Supabase (Auth → Providers → Google → Client ID + Secret). On Android the ID token's audience is the **Web** client, so this must be the Web ID, not Android/iOS.
  - **iOS** client → its reversed ID is the `iosUrlScheme`; the iOS client ID goes in Supabase "Authorized Client IDs" (iOS token audience).
  - **Android** client(s) → one per signing-key SHA-1 (Cloud Console allows only one SHA-1 per Android client, so create a separate client per fingerprint, all with package `com.myorbyt.app`). Android clients are NEVER referenced in code or Supabase — Google uses them only to verify the app's signature. Because the app is live with Play App Signing, register BOTH the **App signing key** SHA-1 (live Play Store app) and the **Upload key** SHA-1 (EAS/dev builds), both found in Play Console → Test and release → App integrity → App signing.
- **Supabase**: enable Google provider, set Web Client ID + Secret, add the **iOS** client ID to "Authorized Client IDs". No SQL/schema change — Google users land in `auth.users` like email users.
- **PRODUCTION PREREQ — publish the OAuth consent screen**: while it's in **Testing**, only allow-listed test users can sign in (100-user cap, refresh tokens expire after 7 days). Before release, Google Cloud Console → OAuth consent screen / Google Auth Platform → **Audience** → **Publish app** (Testing → In production). With only `email`/`profile`/`openid` (non-sensitive) scopes this is instant and needs **no Google verification**.
- **GOTCHA — "Skip nonce check" must be ON**: On iOS, Google's Sign-In SDK embeds a `nonce` claim in the ID token, but `@react-native-google-signin` doesn't expose it to pass to `signInWithIdToken`. Without the Supabase Google provider's **"Skip nonce check"** toggle enabled, sign-in fails with HTTP 400 `Passed nonce and nonce in id_token should either both exist or not.` Token is still validated by signature/audience/expiry — only the nonce check is skipped.

#### Sign in with Apple (iOS only)
- **Why it exists**: Apple **App Store Guideline 4.8** requires apps offering a third-party social login (Google) to also offer Sign in with Apple, or the iOS build is rejected.
- **Library**: `expo-apple-authentication`. `signInWithApple()` in `AuthContext` → `AppleAuthentication.signInAsync()` → `supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken })`.
- **UI**: official `AppleAuthentication.AppleAuthenticationButton` (Apple requires their own button — can't be freely restyled; only black/white/outline + corner radius + label are configurable). Uses `BLACK` style + `CONTINUE` label, `cornerRadius={0}`, wrapped in a bordered `View` (`#5F6368`) to match the black Google button on the pure-black background. Rendered **only when `Platform.OS === 'ios'`**; Android never shows it. The Google button was made black specifically to pair with this — Apple's button is the one that can't change, so Google matches it.
- **Auth screen layout** (`LoginScreen`): order is email/password → ESTABLISH CONNECTION → FORGOT ACCESS CODE? → NEW OPERATOR? REGISTER → "OR" divider → Google → Apple (links sit ABOVE the social buttons).
- **app.json**: `ios.usesAppleSignIn: true` + `expo-apple-authentication` plugin. EAS enables the "Sign in with Apple" capability on the App ID at build time.
- **Supabase**: enable the **Apple** provider, and add the app bundle ID `com.myorbyt.app` to its Client IDs. For native iOS-only sign-in, no Services ID / secret key is required (those are only for the web/Android OAuth flow).
- **Native module** → requires a fresh dev build to test (not in Expo Go, and not in any dev build created before this was added).
- **GOTCHA — "Hide My Email" / private relay**: Apple users can choose **Hide My Email**, in which case the app only ever receives a relay address like `xxxx@privaterelay.appleid.com` (the real email is never exposed — this is unavoidable and creates a separate Supabase user from any Google/email account with the same human). The relay is stable per-user-per-app and forwards to the user's real inbox. **For any outbound email to actually reach these users, the sending domain/address must be registered with Apple**, otherwise mail to relay addresses bounces silently.
  - **Email setup (configured)**: sends via **Resend** (`smtp.resend.com`) from **`no-reply@myorbyt.com`**. Registered in Apple Developer → Certificates, Identifiers & Profiles → **Sign in with Apple for Email Communication**: domain `myorbyt.com` + address `no-reply@myorbyt.com` (Apple verifies via the domain's SPF/DKIM, which Resend provides once the domain is "Verified" there).
  - **Supabase auth emails must use this sender too**: Supabase → Project Settings → Auth → **SMTP Settings** is set to the Resend SMTP + `no-reply@myorbyt.com`. Without custom SMTP, Supabase's signup-confirm/password-reset mails go from the default `…supabase.io` domain (NOT registered with Apple) and bounce for relay users.
- **App Store note**: also returns name/email **only on the first authorization**. Re-test the first-run flow via iPhone Settings → [name] → Sign in with Apple → Orbyt → Stop using Apple ID.

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
- `expo-contacts` with `READ_CONTACTS` permission — used for bulk contact import on AddEditPerson screen (full-screen modal with search, multi-select, and batch add)
- `expo-calendar` with `READ_CALENDAR`/`WRITE_CALENDAR` permissions — historically used for the old Hangout "Book It" feature; currently unused but plugin still wired in app.json
- `@react-native-community/datetimepicker` — native time picker for notification time settings
- `@react-native-google-signin/google-signin` with `iosUrlScheme` — native Google Sign-In (see Authentication > Google Sign-In). Native module → **requires a dev build**, not Expo Go. Pairs with `expo-dev-client`.

### Notifications (iOS & Android)
- **iOS permissions**: Must request with explicit `ios: { allowAlert, allowBadge, allowSound }` options
- **iOS behavior**: `setNotificationHandler` must include `shouldShowBanner` and `shouldShowList` (required by newer expo-notifications)
- **Sound**: Use `sound: 'default'` (string), not `sound: true` (boolean) — iOS requires the string form
- **Scheduling**: Notifications are scheduled as one-shot DATE triggers for the next 7 days (skipping quiet days). The app reschedules whenever `persons` or `settings` change. If the user doesn't open the app for 7+ days, notifications will stop until next open.
- **Wiring**: `AppContext.tsx` requests permissions on init and reschedules notifications via `useEffect` whenever `persons` or `settings` state changes. The notification utility functions in `notifications.ts` must be called from AppContext — they do not self-register.
- **Android**: Uses a `reminders` notification channel with HIGH importance
- **Time picker**: Settings screen uses `@react-native-community/datetimepicker` for minute-level precision (replaces old Alert-based hourly picker)

### Supabase Auth
- User data stored in `auth.users` (protected schema, view in Dashboard > Authentication > Users)
- Session tokens auto-refresh via Supabase client config
- `detectSessionInUrl: false` required for React Native (no browser redirects)
- **Google provider**: enabled in Authentication > Providers > Google with the **Web** OAuth Client ID + Secret. The **iOS** client ID is added to "Authorized Client IDs". Native ID tokens are verified by audience: Android tokens → Web client ID; iOS tokens → iOS client ID. (See Authentication > Google Sign-In.)

### Supabase Tables
- `user_backups` - Encrypted backup blobs (one per user, RLS-protected)
  - Columns: id, user_id, encrypted_data, salt, iv, version, created_at, updated_at
- `events` - London events populated by EventHub pipeline (read-only for authenticated users)
  - Filtered by borough/category/date on the Hangout screen
- `boroughs` - 32 London boroughs + City of London (slug, name); referenced by `events.borough`

### Hangout Screen — Random Event Finder
The Hangout tab is an EventHub-backed events finder. Filters are all multi-select
(borough, event type) plus presets + a custom date.

**Filters:**
- **Boroughs**: bottom-sheet modal with the full `boroughs` lookup. Tap-to-toggle, `Clear` / `Done` in the header. Empty selection = any borough.
- **Event types**: horizontal pills, multi-select. `All` clears the selection. Empty = any type. Categories come from `events.category` (`film`, `food_and_drink`, `music`, `comedy`, `theatre`, `art`, `market`, `talks`, `outdoor`).
- **Date**: presets (`Any time`, `Today`, `Tomorrow`, `Weekend`, `Next 7 days`) plus a `Pick date` pill that opens `@react-native-community/datetimepicker` (Android inline, iOS in a bottom-sheet modal). `Any time` filters to today and forward.

**Random sampling (`src/lib/events.ts → fetchRandomEvents`):**
Two-step ID sample with diversity post-filter — DB function not used.
1. Query `(id, source, category)` for the filtered set, capped at 1000 rows (PostgREST default), ordered by `id` for stability.
2. Fisher–Yates shuffle the candidates.
3. Greedy 3-pass pick:
   - Pass 1: distinct `source` AND distinct `category`.
   - Pass 2: distinct `source` only.
   - Pass 3: fill remaining slots from leftovers.
4. Fetch the chosen rows by `.in('id', ids)` and reorder to match the picked order.

Why diversification: the EventHub pipeline writes 26 cinema workflows, so cinema sources (Vue, Cineworld, …) dominate the table. Without diversification, "Find 3 Events" with any-type filter returned 3 Vue rows almost every time. Source diversity → no repeated chains/venues. Category diversity → with "All" types selected, results spread across film/music/theatre/etc.

Caveats: when a filter yields >1000 rows, the random pool is still capped to the first 1000 by `id`. True uniform random over the whole set requires a Supabase RPC (`order by random() limit n`) — not implemented.

## Environment Variables
Create a `.env` file in the Tend directory (gitignored):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

Get the Supabase values from: Settings > API. Get the Google client IDs from Google Cloud Console > APIs & Services > Credentials (Web + iOS OAuth clients). See the Google Sign-In section under Authentication for full setup.

**GOTCHA — local `.env` is NOT used by EAS cloud builds.** `.env` is gitignored, so it is not uploaded to EAS Build. Cloud builds inline `EXPO_PUBLIC_*` values from **EAS environment variables** (per-environment: `development` / `preview` / `production`), NOT from the local file. The local `.env` is only used by `npx expo start` (local Metro). So every `EXPO_PUBLIC_*` var must ALSO be registered on EAS, or a cloud build comes out with `undefined` values (symptom: build succeeds but app can't reach Supabase / Google sign-in silently fails). Manage with `eas env:create --environment <env> --name <NAME> --value <VALUE>` and verify with `eas env:list --environment <env>`. Vars are scoped per environment and do not leak across (dev vars won't end up in a production build). All four `EXPO_PUBLIC_*` are currently set in both `development` and `production`.

## Running the App
```bash
npm install
npx expo start          # Expo Go — email/password auth only
# Press 'a' for Android, 'i' for iOS, or scan QR with Expo Go
```

**Google Sign-In requires a dev build** (native module, not in Expo Go):
```bash
eas build --profile development --platform android   # and/or --platform ios
# install the build on device, then:
npx expo start --dev-client
```

**First-time setup**: Ensure Supabase has Email auth enabled (Authentication > Providers > Email) and, for Google, the Google provider enabled with the Web client ID/secret.

## Common Tasks
- **Register**: Launch app > Register link > fill email/password > verify email
- **Sign in**: Launch app > enter credentials > "Establish Connection"
- **Sign in / up with Google**: Launch app (dev build) > tap "Continue with Google" > pick account (Login and Register screens both have it)
- **Sign in / up with Apple** (iOS only): Launch app (dev build) > tap the "Sign in with Apple" button > Face ID / confirm
- **Sign out**: Settings > Account > Sign Out
- **Cloud backup**: Settings > Your Data > Cloud Backup > enter password > Create Backup
- **Cloud restore**: Settings > Your Data > Cloud Backup > enter password > Restore from Backup
- **Local export**: Settings > Your Data > Local Backup > Export Data
- **Local import**: Settings > Your Data > Local Backup > Import Data > select JSON file
- **Add a person**: Tap + FAB on Orbit screen → "Launch into Orbit"
- **Add family details**: When adding/editing a person, scroll down to add spouse and kids with birthdays
- **Log contact**: Tap "Log Contact" on person card or detail screen
- **Add context note**: Person detail > Notes section > + Add
- **Find an event**: Hangout tab > pick borough / event type / date > tap "Find 3 Events" > tap a card to open the event link
- **Remove person**: Person detail > "Remove from Orbit"
- **Delete account**: Settings > Account > Delete Account (double confirmation, calls Supabase Edge Function)
- **Bulk import from contacts**: When adding a person, tap "Import from Contacts" → search & multi-select → "Import N Contacts" (added as friends with weekly frequency; edit details later). Long-press a single contact to fill the current form instead.
- **View privacy policy**: Settings > About > Privacy Policy
- **Configure date reminders**: Settings > Birthday & Anniversary Reminders section
