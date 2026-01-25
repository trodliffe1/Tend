import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';
import { colors, spacing } from '../../constants/theme';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const result = await resetPassword(email.trim().toLowerCase());
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>RESET SIGNAL SENT</Text>
          <Text style={styles.successMessage}>
            If an account exists with that email address, you will receive
            instructions to reset your access code.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>RETURN TO LOGIN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>RESET ACCESS</Text>
            <Text style={styles.title}>CODE</Text>
            <Text style={styles.subtitle}>RECOVER YOUR CREDENTIALS</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.instructions}>
              Enter your email address below. We will transmit a reset signal
              with instructions to recover your access.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="operator@orbyt.net"
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>! {error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.buttonText}>TRANSMIT RESET SIGNAL</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.linkText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginTop: spacing.md,
  },
  form: {
    marginBottom: spacing.xl,
  },
  instructions: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 20,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.error,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  linkButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: colors.secondary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
    fontFamily: 'monospace',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  successMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
});
