import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { LANGUAGES, Language } from '@/constants/translations';
import { useApp } from '@/contexts/AppContext';

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { t, setLanguage, settings } = useApp();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(settings.language);

  const handleContinue = () => {
    setLanguage(selectedLanguage);
    router.replace('/onboarding');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.languageSelection.title}</Text>
            <Text style={styles.subtitle}>{t.languageSelection.subtitle}</Text>
          </View>

          <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((language) => (
              <Pressable
                key={language.code}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.code && styles.languageItemSelected,
                ]}
                onPress={() => setSelectedLanguage(language.code)}
              >
                <Text style={styles.flag}>{language.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.languageNameSelected,
                  ]}
                >
                  {language.name}
                </Text>
                {selectedLanguage === language.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>

          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>{t.languageSelection.continue}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  languageItemSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.lightGray,
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  languageNameSelected: {
    color: Colors.gold,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  continueButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  continueButtonText: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
