import { useRouter } from 'expo-router';
import { Scale, Droplets, Brain, ChevronRight } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    icon: Scale,
    titleCs: 'Sledujte svůj úbytek hmotnosti',
    titleEn: 'Track Your Weight Cut',
    descriptionCs: 'Inteligentní systém pro bezpečné a efektivní shazování hmotnosti před zápasem',
    descriptionEn: 'Smart system for safe and effective weight cutting before fights',
    color: Colors.gold,
  },
  {
    icon: Droplets,
    titleCs: 'Zůstaňte hydratovaní',
    titleEn: 'Stay Hydrated',
    descriptionCs: 'Personalizované doporučení pro příjem vody a elektrolytů během přípravy',
    descriptionEn: 'Personalized recommendations for water and electrolyte intake during prep',
    color: '#3B82F6',
  },
  {
    icon: Brain,
    titleCs: 'AI poradce',
    titleEn: 'AI Coach',
    descriptionCs: 'Chytrý asistent vás provede každým krokem až k vážení',
    descriptionEn: 'Smart assistant guides you through every step to weigh-in',
    color: '#8B5CF6',
  },
];

export default function OnboardingScreen() {
  const { t, settings } = useApp();
  const { markOnboardingSeen } = useSubscription();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }
  };

  const handleGetStarted = async () => {
    await markOnboardingSeen();
    router.replace('/welcome');
  };

  const handleSkip = async () => {
    await markOnboardingSeen();
    router.replace('/welcome');
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
      },
    }
  );

  const isLastSlide = currentIndex === slides.length - 1;
  const isCs = settings.language === 'cs';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
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
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.slideContent}>
              <View style={[styles.iconContainer, { backgroundColor: slide.color }]}>
                <slide.icon size={80} color={Colors.white} strokeWidth={1.5} />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  {isCs ? slide.titleCs : slide.titleEn}
                </Text>
                <Text style={styles.description}>
                  {isCs ? slide.descriptionCs : slide.descriptionEn}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {isLastSlide ? (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGetStarted}
          >
            <Text style={styles.buttonText}>{t.onboarding.getStarted}</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>{t.onboarding.next}</Text>
            <ChevronRight size={20} color={Colors.black} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  dotActive: {
    width: 32,
    backgroundColor: Colors.gold,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.black,
  },
});
