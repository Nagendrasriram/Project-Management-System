import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoginSchema } from '@project-mgmt/shared';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, sessionExpiredMessage, clearExpiredMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setServerError(null);
    setErrors({});

    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      await login(validation.data);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check credentials.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setErrors({});
    setServerError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="checkbox" size={32} color="#ffffff" />
          </View>
          <Text style={styles.appTitle}>TaskMatrix</Text>
          <Text style={styles.subtitle}>Sign in to manage projects and tasks</Text>
        </View>

        {/* Expired Session Notice */}
        {sessionExpiredMessage && (
          <View style={styles.sessionExpiredBox}>
            <Ionicons name="information-circle" size={18} color="#b45309" style={{ marginRight: 6 }} />
            <Text style={styles.sessionExpiredText}>{sessionExpiredMessage}</Text>
            <TouchableOpacity onPress={clearExpiredMessage}>
              <Ionicons name="close" size={16} color="#b45309" />
            </TouchableOpacity>
          </View>
        )}

        {/* Server Error Notice */}
        {serverError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#e11d48" style={{ marginRight: 6 }} />
            <Text style={styles.errorBoxText}>{serverError}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="alice@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchAuthButton}
            onPress={() => navigation.navigate('Register')}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={styles.switchAuthText}>Do not have an account? </Text>
              <Text style={styles.switchAuthHighlight}>Sign up</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Demo Account Fill Buttons */}
        <View style={styles.demoSection}>
          <Text style={styles.demoLabel}>Demo Accounts (Tap to autofill):</Text>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={styles.demoBadge}
              onPress={() => autofillDemo('alice@example.com')}
            >
              <Text style={styles.demoBadgeText}>Alice (2 Projects)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBadge}
              onPress={() => autofillDemo('bob@example.com')}
            >
              <Text style={styles.demoBadgeText}>Bob (1 Project)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  sessionExpiredBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  sessionExpiredText: {
    flex: 1,
    color: '#b45309',
    fontSize: 13,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    borderColor: '#ffe4e6',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBoxText: {
    flex: 1,
    color: '#e11d48',
    fontSize: 13,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#0f172a',
  },
  inputError: {
    borderColor: '#f43f5e',
  },
  errorText: {
    color: '#f43f5e',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  switchAuthButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchAuthText: {
    fontSize: 13,
    color: '#64748b',
  },
  switchAuthHighlight: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  demoBadgeText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
});
