import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    if (touched.email && email) {
      validateEmail(email);
    }
  }, [email, touched.email]);

  useEffect(() => {
    if (touched.password && password) {
      validatePassword(password);
    }
  }, [password, touched.password]);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError(t.auth?.emptyFields || 'Email je povinný');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Neplatný formát emailu');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError(t.auth?.emptyFields || 'Heslo je povinné');
      return false;
    }
    if (value.length < 6) {
      setPasswordError(t.auth?.passwordTooShort || 'Heslo musí mít alespoň 6 znaků');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    setTouched({ email: true, password: true });

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('[Login] Attempting to sign in with email:', email);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        console.error('[Login] Sign in error:', signInError);
        if (signInError.message.toLowerCase().includes('invalid login')) {
          setError('Neplatný email nebo heslo');
        } else if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email nebyl potvrzen. Zkontrolujte svou e-mailovou schránku.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data.user) {
        console.log('[Login] Successfully signed in, user ID:', data.user.id);
        console.log('[Login] Navigation will be handled by AppContext');
      }
    } catch (err) {
      console.error('[Login] Unexpected error:', err);
      setError(t.auth?.loginError || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert(
        t.auth?.forgotPassword || 'Forgot Password',
        t.auth?.enterEmailFirst || 'Please enter your email address first',
        [{ text: t.auth?.ok || 'OK' }]
      );
      return;
    }

    Alert.alert(
      t.auth?.forgotPassword || 'Forgot Password',
      t.auth?.resetPasswordConfirm || 'Send password reset email to ' + email + '?',
      [
        { text: t.auth?.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.auth?.send || 'Send',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
              if (error) {
                Alert.alert(t.auth?.error || 'Error', error.message);
              } else {
                Alert.alert(
                  t.auth?.success || 'Success',
                  t.auth?.resetEmailSent || 'Password reset email sent'
                );
              }
            } catch (err) {
              console.error('[Login] Password reset error:', err);
            }
          },
        },
      ]
    );
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
            <Text style={styles.title}>{t.auth?.login || 'Přihlášení'}</Text>
            <Text style={styles.subtitle}>
              {t.auth?.loginSubtitle || 'Přihlaste se do svého účtu'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View>
              <View style={[
                styles.inputContainer,
                emailError && touched.email && styles.inputError,
                !emailError && email && touched.email && styles.inputSuccess,
              ]}>
                <View style={styles.inputIconContainer}>
                  <Mail size={20} color={emailError && touched.email ? Colors.error : Colors.textSecondary} />
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
                  onBlur={() => setTouched({ ...touched, email: true })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!isLoading}
                />
                {!emailError && email && touched.email && (
                  <CheckCircle2 size={20} color={Colors.gold} style={{ marginLeft: 8 }} />
                )}
              </View>
              {emailError && touched.email && (
                <Text style={styles.inputErrorText}>{emailError}</Text>
              )}
            </View>

            <View>
              <View style={[
                styles.inputContainer,
                passwordError && touched.password && styles.inputError,
                !passwordError && password && touched.password && styles.inputSuccess,
              ]}>
                <View style={styles.inputIconContainer}>
                  <Lock size={20} color={passwordError && touched.password ? Colors.error : Colors.textSecondary} />
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
                  onBlur={() => setTouched({ ...touched, password: true })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
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
              {passwordError && touched.password && (
                <Text style={styles.inputErrorText}>{passwordError}</Text>
              )}
            </View>

            <Pressable onPress={handleForgotPassword} disabled={isLoading}>
              <Text style={styles.forgotPassword}>
                {t.auth?.forgotPassword || 'Zapomenuté heslo?'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={styles.loginText}>{t.auth?.login || 'Přihlásit se'}</Text>
              )}
            </Pressable>

            <View style={styles.registerContainer}>
              <Text style={styles.registerLabel}>
                {t.auth?.noAccount || 'Nemáte účet?'}
              </Text>
              <Pressable onPress={handleRegister} disabled={isLoading}>
                <Text style={styles.registerLink}>
                  {t.auth?.register || 'Registrovat se'}
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  inputSuccess: {
    borderColor: Colors.gold,
    backgroundColor: '#FFFBEB',
  },
  inputErrorText: {
    fontSize: 13,
    color: Colors.error,
    marginTop: 6,
    marginLeft: 16,
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
  forgotPassword: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '600' as const,
    textAlign: 'right',
    marginTop: 8,
  },
  buttonsContainer: {
    gap: 16,
  },
  loginButton: {
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
  loginText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  registerLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  registerLink: {
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
});
