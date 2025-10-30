import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Target, Droplets, Shield, User, Briefcase } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { UserRole } from '@/constants/types';
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: Target,
    key: 'slide1' as const,
  },
  {
    icon: Droplets,
    key: 'slide2' as const,
  },
  {
    icon: Shield,
    key: 'slide3' as const,
  },
];

const TOTAL_SLIDES = SLIDES.length + 1;

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  });

  const handleNext = async () => {
    if (currentIndex < TOTAL_SLIDES - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: width * nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      if (email && password && selectedRole) {
        await handleRegistration();
      }
    }
  };

  const handleRegistration = async () => {
    setIsRegistering(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          Alert.alert(t.auth.error, error.message);
          return;
        }

        if (data.user) {
          router.replace('/profile-setup');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              role: selectedRole,
            },
          },
        });

        if (error) {
          Alert.alert(t.auth.error, error.message);
          return;
        }

        if (data.user) {
          router.replace('/profile-setup');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert(t.auth.error, t.auth.unexpectedError);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'exp://localhost:8081/profile-setup',
        },
      });

      if (error) {
        Alert.alert(t.auth.error, error.message);
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'exp://localhost:8081/profile-setup'
        );

        if (result.type === 'success') {
          router.replace('/profile-setup');
        }
      }
    } catch (error) {
      console.error('Google auth error:', error);
      Alert.alert(t.auth.error, t.auth.unexpectedError);
    }
  };

  const handleAppleAuth = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });

      if (error) {
        Alert.alert(t.auth.error, error.message);
        return;
      }

      if (data.user) {
        router.replace('/profile-setup');
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      console.error('Apple auth error:', error);
      Alert.alert(t.auth.error, t.auth.unexpectedError);
    }
  };

  const isLastSlideValid = email.trim() !== '' && password.length >= 6 && (isLogin || selectedRole !== null);

  const handleSkip = async () => {
    router.replace('/profile-setup');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.skipContainer, { paddingTop: insets.top + 20 }]}>
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>{t.onboarding.skip}</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      >
        {SLIDES.map((slide, index) => {
          const Icon = slide.icon;
          const slideData = t.onboarding[slide.key];
          return (
            <View key={index} style={styles.slide}>
              <View style={styles.iconContainer}>
                <Icon size={120} color={Colors.gold} strokeWidth={1.5} />
              </View>
              <Text style={styles.slideTitle}>{slideData.title}</Text>
              <Text style={styles.slideDescription}>{slideData.description}</Text>
            </View>
          );
        })}
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.slide}
        >
          <View style={styles.registrationSlide}>
            <Text style={styles.slideTitle}>{isLogin ? t.auth.login : t.auth.register}</Text>
            <Text style={styles.slideDescription}>{isLogin ? t.auth.loginSubtitle : t.auth.registerSubtitle}</Text>
            
            <View style={styles.oauthButtons}>
              {Platform.OS === 'ios' && (
                <Pressable style={styles.oauthButton} onPress={handleAppleAuth}>
                  <View style={styles.oauthContent}>
                    <Text style={styles.oauthIcon}>🍎</Text>
                    <Text style={styles.oauthText}>{t.auth.continueWithApple}</Text>
                  </View>
                </Pressable>
              )}
              <Pressable style={styles.oauthButton} onPress={handleGoogleAuth}>
                <View style={styles.oauthContent}>
                  <Text style={styles.oauthIcon}>🔵</Text>
                  <Text style={styles.oauthText}>{t.auth.continueWithGoogle}</Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.auth.orContinueWith}</Text>
              <View style={styles.dividerLine} />
            </View>
            
            {!isLogin && (
              <View style={styles.roleSelection}>
                <Text style={styles.roleLabel}>{t.profile.accountType}</Text>
                <View style={styles.roleButtons}>
                  <Pressable
                    style={[styles.roleButton, selectedRole === 'fighter' && styles.roleButtonActive]}
                    onPress={() => setSelectedRole('fighter')}
                  >
                    <User size={24} color={selectedRole === 'fighter' ? Colors.gold : Colors.textSecondary} />
                    <Text style={[styles.roleButtonText, selectedRole === 'fighter' && styles.roleButtonTextActive]}>
                      {t.profile.fighter}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.roleButton, selectedRole === 'coach' && styles.roleButtonActive]}
                    onPress={() => setSelectedRole('coach')}
                  >
                    <Briefcase size={24} color={selectedRole === 'coach' ? Colors.gold : Colors.textSecondary} />
                    <Text style={[styles.roleButtonText, selectedRole === 'coach' && styles.roleButtonTextActive]}>
                      {t.profile.coach}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View style={styles.registrationForm}>
              <TextInput
                style={styles.registrationInput}
                value={email}
                onChangeText={setEmail}
                placeholder={t.auth.email}
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.registrationInput}
                value={password}
                onChangeText={setPassword}
                placeholder={t.auth.password}
                placeholderTextColor={Colors.textLight}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Pressable onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switchAuthText}>
                {isLogin ? t.auth.noAccount : t.auth.hasAccount}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.pagination}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          style={[
            styles.nextButton,
            (currentIndex === TOTAL_SLIDES - 1 && !isLastSlideValid) || isRegistering && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={(currentIndex === TOTAL_SLIDES - 1 && !isLastSlideValid) || isRegistering}
        >
          {isRegistering ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentIndex === TOTAL_SLIDES - 1 ? (isLogin ? t.auth.loginButton : t.auth.registerButton) : t.onboarding.next}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  skipContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  slide: {
    width,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 48,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  slideDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.mediumGray,
  },
  dotActive: {
    backgroundColor: Colors.gold,
    width: 24,
  },
  nextButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  registrationSlide: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  oauthButtons: {
    gap: 12,
    marginTop: 24,
  },
  oauthButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border.light,
  },
  oauthContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  oauthIcon: {
    fontSize: 20,
  },
  oauthText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.light,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  },
  switchAuthText: {
    fontSize: 14,
    color: Colors.gold,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600' as const,
  },
  roleSelection: {
    marginTop: 16,
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  roleButtonActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.lightGray,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  roleButtonTextActive: {
    color: Colors.gold,
  },
  registrationForm: {
    gap: 12,
  },
  registrationInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
});
