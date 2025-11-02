import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Bell, Droplets, Utensils, Scale, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import {
  getNotificationSettings,
  saveNotificationSettings,
  scheduleAllReminders,
  sendTestNotification,
  type NotificationSettings,
} from '@/utils/notifications';

export default function NotificationSettingsScreen() {
  const { t } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await getNotificationSettings();
    setSettings(loaded);
  };

  const updateSetting = async <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    if (!settings) return;

    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveNotificationSettings({ [key]: value });
  };

  const handleSaveAndSchedule = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await saveNotificationSettings(settings);
      await scheduleAllReminders();
      Alert.alert(
        '✅ Uloženo',
        'Připomínky byly nastaveny a naplánované'
      );
    } catch (error) {
      console.error('[NotificationSettings] Error saving:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit nastavení');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
    Alert.alert(
      'Testovací notifikace',
      'Zkušební připomínka byla odeslána. Měla by se zobrazit za 2 sekundy.'
    );
  };

  if (!settings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Načítání...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Bell size={28} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>Nastavení oznámení</Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={28} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Droplets size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Připomínky na vodu</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Zapnout připomínky</Text>
              <Text style={styles.settingDescription}>
                Připomínky na pravidelnou hydrataci
              </Text>
            </View>
            <Switch
              value={settings.waterReminders}
              onValueChange={(value) => updateSetting('waterReminders', value)}
              trackColor={{ false: Colors.lightGray, true: Colors.gold }}
              thumbColor={Colors.white}
            />
          </View>

          {settings.waterReminders && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsLabel}>Interval připomínek</Text>
              <View style={styles.intervalButtons}>
                {[1, 2, 3, 4].map((hours) => (
                  <Pressable
                    key={hours}
                    style={[
                      styles.intervalButton,
                      settings.waterInterval === hours && styles.intervalButtonActive,
                    ]}
                    onPress={() => updateSetting('waterInterval', hours)}
                  >
                    <Text
                      style={[
                        styles.intervalButtonText,
                        settings.waterInterval === hours && styles.intervalButtonTextActive,
                      ]}
                    >
                      {hours}h
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Utensils size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Připomínky na jídlo</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Zapnout připomínky</Text>
              <Text style={styles.settingDescription}>
                Připomínky na záznam jídel
              </Text>
            </View>
            <Switch
              value={settings.mealReminders}
              onValueChange={(value) => updateSetting('mealReminders', value)}
              trackColor={{ false: Colors.lightGray, true: Colors.gold }}
              thumbColor={Colors.white}
            />
          </View>

          {settings.mealReminders && (
            <View style={styles.detailsBox}>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>🍳 Snídaně</Text>
                <Text style={styles.timeValue}>{settings.breakfastTime}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>🍽️ Oběd</Text>
                <Text style={styles.timeValue}>{settings.lunchTime}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>🥗 Večeře</Text>
                <Text style={styles.timeValue}>{settings.dinnerTime}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Scale size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Připomínky na vážení</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Zapnout připomínky</Text>
              <Text style={styles.settingDescription}>
                Ranní a večerní připomínka na vážení
              </Text>
            </View>
            <Switch
              value={settings.weightReminders}
              onValueChange={(value) => updateSetting('weightReminders', value)}
              trackColor={{ false: Colors.lightGray, true: Colors.gold }}
              thumbColor={Colors.white}
            />
          </View>

          {settings.weightReminders && (
            <View style={styles.detailsBox}>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>🌅 Ranní vážení</Text>
                <Text style={styles.timeValue}>{settings.morningWeightTime}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>🌙 Večerní vážení</Text>
                <Text style={styles.timeValue}>{settings.eveningWeightTime}</Text>
              </View>
            </View>
          )}
        </View>

        {Platform.OS !== 'web' && (
          <View style={styles.testSection}>
            <Pressable style={styles.testButton} onPress={handleTestNotification}>
              <Bell size={20} color={Colors.textPrimary} />
              <Text style={styles.testButtonText}>Otestovat notifikace</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Připomínky pomáhají udržet pravidelnost v sledování vašeho pokroku. Můžete je kdykoli vypnout nebo upravit.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
            isSaving && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveAndSchedule}
          disabled={isSaving}
        >
          <Check size={20} color={Colors.black} />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Ukládám...' : 'Uložit a naplánovat'}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailsBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  intervalButtonActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.white,
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  intervalButtonTextActive: {
    color: Colors.gold,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  timeLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  testSection: {
    marginBottom: 24,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  infoBox: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.black,
  },
});
