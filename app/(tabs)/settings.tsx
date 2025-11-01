import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Globe,
  Bell,
  CreditCard,
  HelpCircle,
  Shield,
  FileText,
  ChevronRight,
  X,
  Crown,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { LANGUAGES, Language } from '@/constants/translations';
import { Discipline } from '@/constants/types';

export default function SettingsScreen() {
  const { t, profile, updateProfile, settings, setLanguage, signOut } = useApp();
  const { isPremium, isTrial, isFree, trialDaysRemaining } = useSubscription();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(settings.language);

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [age, setAge] = useState(profile?.age.toString() || '');
  const [height, setHeight] = useState(profile?.height.toString() || '');
  const [currentWeight, setCurrentWeight] = useState(profile && profile.role === 'fighter' ? profile.currentWeight.toString() : '');
  const [targetWeight, setTargetWeight] = useState(profile && profile.role === 'fighter' ? profile.targetWeight.toString() : '');
  const [discipline, setDiscipline] = useState<Discipline>(profile?.discipline || 'mma');

  const disciplines: Discipline[] = ['mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing'];

  const handleLanguageChange = () => {
    setLanguage(selectedLanguage);
    setIsLanguageModalVisible(false);
  };

  const handleProfileUpdate = async () => {
    if (!profile) return;
    
    if (profile.role === 'fighter') {
      await updateProfile({
        fullName,
        age: parseInt(age, 10),
        height: parseInt(height, 10),
        currentWeight: parseFloat(currentWeight),
        targetWeight: parseFloat(targetWeight),
        discipline,
      });
    } else {
      await updateProfile({
        fullName,
        age: parseInt(age, 10),
        height: parseInt(height, 10),
        discipline,
      });
    }

    setIsProfileModalVisible(false);
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
  }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        <Icon size={22} color={Colors.textPrimary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && <ChevronRight size={20} color={Colors.textSecondary} />}
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t.settings.title}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.account}</Text>
          <View style={styles.card}>
            <SettingItem
              icon={User}
              title={t.settings.editProfile}
              subtitle={profile?.fullName}
              onPress={() => {
                if (!profile) return;
                setFullName(profile.fullName);
                setAge(profile.age.toString());
                setHeight(profile.height.toString());
                if (profile.role === 'fighter') {
                  setCurrentWeight(profile.currentWeight.toString());
                  setTargetWeight(profile.targetWeight.toString());
                }
                setDiscipline(profile.discipline);
                setIsProfileModalVisible(true);
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.preferences}</Text>
          <View style={styles.card}>
            <SettingItem
              icon={Globe}
              title={t.settings.language}
              subtitle={LANGUAGES.find((l) => l.code === settings.language)?.name}
              onPress={() => {
                setSelectedLanguage(settings.language);
                setIsLanguageModalVisible(true);
              }}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Bell}
              title={t.settings.notifications}
              subtitle={t.settings.enabled}
              onPress={() => Alert.alert(t.settings.notifications, t.settings.notificationsComingSoon)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.premium}</Text>
          <View style={styles.card}>
            {isPremium && (
              <View style={[styles.settingItem, styles.premiumBanner]}>
                <View style={styles.settingIconContainer}>
                  <Crown size={22} color={Colors.gold} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Premium</Text>
                  <Text style={styles.settingSubtitle}>Všechny funkce odmċněny</Text>
                </View>
              </View>
            )}
            {isTrial && (
              <View style={[styles.settingItem, styles.trialBanner]}>
                <View style={styles.settingIconContainer}>
                  <Crown size={22} color={Colors.gold} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Zkušební období</Text>
                  <Text style={styles.settingSubtitle}>
                    {trialDaysRemaining} {trialDaysRemaining === 1 ? 'den' : trialDaysRemaining < 5 ? 'dny' : 'dní'} zbývá
                  </Text>
                </View>
              </View>
            )}
            {!isPremium && <View style={styles.divider} />}
            <SettingItem
              icon={CreditCard}
              title={t.settings.subscription}
              subtitle={isFree ? 'Základní verze' : isTrial ? `Zkušební období (${trialDaysRemaining} dní)` : 'Premium aktivní'}
              onPress={() => router.push('/subscription')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings.about}</Text>
          <View style={styles.card}>
            <SettingItem
              icon={HelpCircle}
              title={t.settings.support}
              onPress={() => router.push('/support')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={Shield}
              title={t.settings.privacy}
              onPress={() => router.push('/privacy')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={FileText}
              title={t.settings.terms}
              onPress={() => router.push('/terms')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon={FileText}
              title={t.settings.version}
              subtitle="1.0.0"
              showChevron={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Pressable 
              style={styles.signOutButton} 
              onPress={async () => {
                Alert.alert(
                  t.settings.confirmSignOut,
                  t.settings.signOutMessage,
                  [
                    {
                      text: t.common.cancel,
                      style: 'cancel',
                    },
                    {
                      text: t.settings.signOut,
                      style: 'destructive',
                      onPress: async () => {
                        await signOut();
                        router.replace('/welcome');
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.signOutButtonText}>{t.settings.signOut}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.appName}>Chytré Shazování</Text>
          <Text style={styles.copyright}>© 2025 All rights reserved</Text>
        </View>
      </ScrollView>

      <Modal
        visible={isLanguageModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.modalTitle}>{t.settings.language}</Text>
            <Pressable onPress={() => setIsLanguageModalVisible(false)}>
              <X size={28} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
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
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable style={styles.saveButton} onPress={handleLanguageChange}>
              <Text style={styles.saveButtonText}>{t.common.save}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isProfileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsProfileModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={[
              styles.modalContent,
              { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.settings.editProfile}</Text>
              <Pressable onPress={() => setIsProfileModalVisible(false)}>
                <X size={28} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.profile.fullName}</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t.profile.fullName}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>{t.profile.age}</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>{t.profile.height}</Text>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              {profile && profile.role === 'fighter' && (
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>{t.profile.currentWeight}</Text>
                    <TextInput
                      style={styles.input}
                      value={currentWeight}
                      onChangeText={setCurrentWeight}
                      keyboardType="decimal-pad"
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>

                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>{t.profile.targetWeight}</Text>
                    <TextInput
                      style={styles.input}
                      value={targetWeight}
                      onChangeText={setTargetWeight}
                      keyboardType="decimal-pad"
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.profile.discipline}</Text>
                <View style={styles.disciplineGrid}>
                  {disciplines.map((disc) => (
                    <Pressable
                      key={disc}
                      style={[
                        styles.disciplineButton,
                        discipline === disc && styles.disciplineButtonActive,
                      ]}
                      onPress={() => setDiscipline(disc)}
                    >
                      <Text
                        style={[
                          styles.disciplineText,
                          discipline === disc && styles.disciplineTextActive,
                        ]}
                      >
                        {t.profile.disciplines[disc]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <Pressable style={styles.saveButton} onPress={handleProfileUpdate}>
              <Text style={styles.saveButtonText}>{t.common.save}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginLeft: 68,
  },
  signOutButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  bottomSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.black,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  languageItemSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.lightGray,
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  languageNameSelected: {
    color: Colors.gold,
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  disciplineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  disciplineButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  disciplineButtonActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.lightGray,
  },
  disciplineText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  disciplineTextActive: {
    color: Colors.gold,
  },
  saveButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  premiumBanner: {
    backgroundColor: Colors.lightGray,
  },
  trialBanner: {
    backgroundColor: Colors.lightGray,
  },
});
