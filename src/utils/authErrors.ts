// Map Supabase error codes to user-friendly messages
// Prevents leaking sensitive information about system state

const errorMessages: Record<string, string> = {
  // Authentication errors
  'Invalid login credentials': 'Invalid email or password',
  'Email not confirmed': 'Please verify your email address before signing in',
  'User already registered': 'An account with this email already exists',
  'Password should be at least 6 characters': 'Password must be at least 8 characters',
  'Unable to validate email address: invalid format': 'Please enter a valid email address',
  'Signup requires a valid password': 'Please enter a password',
  'User not found': 'Invalid email or password',
  'Email rate limit exceeded': 'Too many attempts. Please try again later',
  'For security purposes, you can only request this once every 60 seconds':
    'Please wait before requesting another password reset',

  // Network errors
  'Failed to fetch': 'Connection failed. Please check your internet connection',
  'Network request failed': 'Connection failed. Please check your internet connection',

  // Token errors
  'JWT expired': 'Your session has expired. Please sign in again',
  'Invalid Refresh Token': 'Your session has expired. Please sign in again',
};

export function getAuthErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Check for known error messages
    if (errorMessages[message]) {
      return errorMessages[message];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(errorMessages)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Generic fallback - don't expose raw error messages
    return 'An error occurred. Please try again';
  }

  // Handle string errors
  if (typeof error === 'string') {
    if (errorMessages[error]) {
      return errorMessages[error];
    }
    return 'An error occurred. Please try again';
  }

  // Handle Supabase error objects
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    if (typeof errorObj.message === 'string') {
      if (errorMessages[errorObj.message]) {
        return errorMessages[errorObj.message];
      }
    }

    if (typeof errorObj.error_description === 'string') {
      if (errorMessages[errorObj.error_description]) {
        return errorMessages[errorObj.error_description];
      }
    }
  }

  return 'An unexpected error occurred';
}
