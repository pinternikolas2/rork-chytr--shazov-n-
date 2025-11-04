import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pass: string): boolean => {
    return pass.length >= 6;
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError(t.auth?.emptyFields || 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth?.passwordMismatch || 'Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setError(t.auth?.passwordTooShort || 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[Register] Attempting to sign up with email:', email);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (signUpError) {
        console.error('[Register] Sign up error:', signUpError);
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        console.log('[Register] Successfully signed up, user ID:', data.user.id);
        
        if (data.session) {
          console.log('[Register] User is automatically signed in, redirecting to profile setup');
          router.replace('/profile-setup');
        } else {
          console.log('[Register] Email confirmation required');
          Alert.alert(
            t.auth?.success || 'Success',
            t.auth?.confirmEmail || 'Please check your email to confirm your account',
            [
              {
                text: t.auth?.ok || 'OK',
                onPress: () => router.replace('/login'),
              },
            ]
          );
        }
      }
    } catch (err) {
      console.error('[Register] Unexpected error:', err);
      setError(t.auth?.registerError || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.replace('/login');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: Colors.white }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t.auth?.register || 'Registrace'}</Text>
            <Text style={styles.subtitle}>
              {t.auth?.registerSubtitle || 'Vytvořte si nový účet'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <User size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t.auth?.name || 'Jméno'}
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError('');
                }}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Mail size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t.auth?.email || 'Email'}
                placeholderTextColor={Colors.textLight}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Lock size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t.auth?.password || 'Heslo'}
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                editable={!isLoading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Lock size={20} color={Colors.textSecondary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={t.auth?.confirmPassword || 'Potvrdit heslo'}
                placeholderTextColor={Colors.textLight}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                editable={!isLoading}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )}
              </Pressable>
            </View>

            <Text style={styles.hint}>
              {t.auth?.passwordHint || 'Heslo musí mít alespoň 6 znaků'}
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={styles.registerText}>
                  {t.auth?.register || 'Registrovat se'}
                </Text>
              )}
            </Pressable>

            <View style={styles.loginContainer}>
              <Text style={styles.loginLabel}>
                {t.auth?.haveAccount || 'Už máte účet?'}
              </Text>
              <Pressable onPress={handleLogin} disabled={isLoading}>
                <Text style={styles.loginLink}>
                  {t.auth?.login || 'Přihlásit se'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleBack}
              disabled={isLoading}
            >
              <Text style={styles.backText}>{t.auth?.back || 'Zpět'}</Text>
            </Pressable>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              {t.auth?.termsPrefix || 'Registrací souhlasíte s našimi '}
              <Text style={styles.termsLink}>
                {t.auth?.termsOfService || 'Podmínkami služby'}
              </Text>
              {t.auth?.termsMiddle || ' a '}
              <Text style={styles.termsLink}>
                {t.auth?.privacyPolicy || 'Zásadami ochrany osobních údajů'}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500' as const,
  },
  form: {
    marginBottom: 32,
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  hint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: -8,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  registerButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 15,
    color: Colors.gold,
    fontWeight: '600' as const,
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  termsContainer: {
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.gold,
    fontWeight: '600' as const,
  },
});
