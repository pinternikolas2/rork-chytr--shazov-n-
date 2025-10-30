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
} from 'react-native';
import { Target, Droplets, Shield, User, Briefcase } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { UserRole } from '@/constants/types';

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

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  });

  const handleNext = () => {
    if (currentIndex < TOTAL_SLIDES - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: width * nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      if (email && password && selectedRole) {
        router.replace('/profile-setup');
      }
    }
  };

  const isLastSlideValid = email.trim() !== '' && password.length >= 6 && selectedRole !== null;

  const handleSkip = () => {
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
            <Text style={styles.slideTitle}>{t.onboarding.registration.title}</Text>
            <Text style={styles.slideDescription}>{t.onboarding.registration.subtitle}</Text>
            
            <View style={styles.roleSelection}>
              <Text style={styles.roleLabel}>{t.profile.accountType}</Text>
              <View style={styles.roleButtons}>
                <Pressable
                  style={[styles.roleButton, selectedRole === 'fighter' && styles.roleButtonActive]}
                  onPress={() => setSelectedRole('fighter')}
                >
                  <User size={32} color={selectedRole === 'fighter' ? Colors.gold : Colors.textSecondary} />
                  <Text style={[styles.roleButtonText, selectedRole === 'fighter' && styles.roleButtonTextActive]}>
                    {t.profile.fighter}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.roleButton, selectedRole === 'coach' && styles.roleButtonActive]}
                  onPress={() => setSelectedRole('coach')}
                >
                  <Briefcase size={32} color={selectedRole === 'coach' ? Colors.gold : Colors.textSecondary} />
                  <Text style={[styles.roleButtonText, selectedRole === 'coach' && styles.roleButtonTextActive]}>
                    {t.profile.coach}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.registrationForm}>
              <TextInput
                style={styles.registrationInput}
                value={email}
                onChangeText={setEmail}
                placeholder={t.onboarding.registration.emailPlaceholder}
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.registrationInput}
                value={password}
                onChangeText={setPassword}
                placeholder={t.onboarding.registration.passwordPlaceholder}
                placeholderTextColor={Colors.textLight}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
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
            currentIndex === TOTAL_SLIDES - 1 && !isLastSlideValid && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={currentIndex === TOTAL_SLIDES - 1 && !isLastSlideValid}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === TOTAL_SLIDES - 1 ? t.onboarding.getStarted : t.onboarding.next}
          </Text>
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
    paddingVertical: 40,
    justifyContent: 'center',
  },
  roleSelection: {
    marginTop: 32,
    marginBottom: 24,
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
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
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
