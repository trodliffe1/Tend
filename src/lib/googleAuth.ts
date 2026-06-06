import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Configure the native Google Sign-In SDK.
 *
 * - `webClientId` is the OAuth **Web** client ID from Google Cloud Console.
 *   Supabase validates the returned ID token against this, so it is required.
 * - `iosClientId` is the OAuth **iOS** client ID (only used on iOS).
 *
 * Both come from `.env` (EXPO_PUBLIC_* so they're inlined at build time).
 * Call this once on app startup before any GoogleSignin.signIn() call.
 */
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
  });
}
