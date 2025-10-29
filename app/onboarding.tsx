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
  View,
} from 'react-native';
import { Target, Droplets, Shield } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

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

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  });

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: width * nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      router.replace('/profile-setup');
    }
  };

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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === SLIDES.length - 1 ? t.onboarding.getStarted : t.onboarding.next}
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
});
