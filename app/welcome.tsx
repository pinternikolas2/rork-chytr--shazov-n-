import { useRouter } from 'expo-router';
import { Dumbbell } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { LANGUAGES } from '@/constants/translations';
import { useApp } from '@/contexts/AppContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, settings, setLanguage } = useApp();
  const { startTrial, markWelcomeSeen, skipWelcome } = useSubscription();

  const handleTryFree = async () => {
    await startTrial();
    await markWelcomeSeen();
    router.replace('/language-selection');
  };

  const handleContinueWithoutAccount = async () => {
    await skipWelcome();
    router.replace('/language-selection');
  };

  const handleLogin = async () => {
    await markWelcomeSeen();
    router.replace('/language-selection');
  };

  const handlePrivacy = () => {
    router.push('/privacy');
  };

  const handleTerms = () => {
    router.push('/terms');
  };

  const toggleLanguage = () => {
    const newLang = settings.language === 'cs' ? 'en' : 'cs';
    setLanguage(newLang);
  };

  const currentLang = LANGUAGES.find(l => l.code === settings.language);

  return (
    <View style={[styles.container, { backgroundColor: Colors.white }]}>
      <View style={[styles.backgroundPattern, { paddingTop: insets.top }]}>
        <View style={styles.headerBar}>
          <Pressable onPress={toggleLanguage} style={styles.languageButton}>
            <Text style={styles.languageFlag}>{currentLang?.flag}</Text>
            <Text style={styles.languageText}>{currentLang?.code.toUpperCase()}</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Dumbbell size={64} color={Colors.black} strokeWidth={2} />
            </View>
          </View>

          <Text style={styles.title}>{t.welcome.title}</Text>
          <Text style={styles.subtitle}>{t.welcome.subtitle}</Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>AI analýza jídel</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Pokročilé statistiky</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Personalizované rady</Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.tryFreeButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleTryFree}
            >
              <Text style={styles.tryFreeText}>{t.welcome.tryFree}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleContinueWithoutAccount}
            >
              <Text style={styles.continueText}>{t.welcome.continueWithoutAccount}</Text>
            </Pressable>

            <Pressable onPress={handleLogin} style={styles.loginLink}>
              <Text style={styles.loginText}>{t.welcome.alreadyHaveAccount}</Text>
            </Pressable>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>{t.welcome.trialInfo}</Text>
          </View>

          <View style={styles.footerLinks}>
            <Pressable onPress={handleTerms}>
              <Text style={styles.linkText}>Podmínky služby</Text>
            </Pressable>
            <Text style={styles.linkSeparator}>|</Text>
            <Pressable onPress={handlePrivacy}>
              <Text style={styles.linkText}>Zásady ochrany</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <View
        style={[
          styles.bottomSafeArea,
          { height: insets.bottom || 20, backgroundColor: Colors.white },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    flex: 1,
    position: 'relative' as const,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  languageFlag: {
    fontSize: 18,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  featureText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  tryFreeButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  continueButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.black,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  tryFreeText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.black,
  },
  loginLink: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  linkSeparator: {
    fontSize: 12,
    color: Colors.textLight,
  },
  bottomSafeArea: {
    backgroundColor: Colors.white,
  },
});
