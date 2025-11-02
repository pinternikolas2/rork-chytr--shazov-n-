import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSettings {
  waterReminders: boolean;
  mealReminders: boolean;
  weightReminders: boolean;
  morningWeightTime: string;
  eveningWeightTime: string;
  waterInterval: number;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  waterReminders: true,
  mealReminders: true,
  weightReminders: true,
  morningWeightTime: '07:00',
  eveningWeightTime: '21:00',
  waterInterval: 2,
  breakfastTime: '08:00',
  lunchTime: '12:30',
  dinnerTime: '19:00',
};

const STORAGE_KEY = 'notificationSettings';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Skipping permission request on web');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
      });
    }

    console.log('[Notifications] Permissions granted');
    return true;
  } catch (error) {
    console.error('[Notifications] Error requesting permissions:', error);
    return false;
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('[Notifications] Error loading settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('[Notifications] Settings saved:', updated);
  } catch (error) {
    console.error('[Notifications] Error saving settings:', error);
  }
}

export async function scheduleWaterReminders(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const settings = await getNotificationSettings();
    if (!settings.waterReminders) {
      console.log('[Notifications] Water reminders disabled');
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const startHour = 8;
    const endHour = 21;
    const interval = settings.waterInterval;

    for (let hour = startHour; hour <= endHour; hour += interval) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Nezapomeň pít!',
          body: 'Je čas doplnit hydrataci. Zůstaň hydratovaný!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute: 0,
          repeats: true,
        },
      });
    }

    console.log('[Notifications] Water reminders scheduled');
  } catch (error) {
    console.error('[Notifications] Error scheduling water reminders:', error);
  }
}

export async function scheduleMealReminders(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const settings = await getNotificationSettings();
    if (!settings.mealReminders) {
      console.log('[Notifications] Meal reminders disabled');
      return;
    }

    const meals = [
      { time: settings.breakfastTime, name: 'Snídaně', emoji: '🍳' },
      { time: settings.lunchTime, name: 'Oběd', emoji: '🍽️' },
      { time: settings.dinnerTime, name: 'Večeře', emoji: '🥗' },
    ];

    for (const meal of meals) {
      const [hour, minute] = meal.time.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${meal.emoji} Čas na ${meal.name.toLowerCase()}!`,
          body: 'Nezapomeň zaznamenat své jídlo',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
        },
      });
    }

    console.log('[Notifications] Meal reminders scheduled');
  } catch (error) {
    console.error('[Notifications] Error scheduling meal reminders:', error);
  }
}

export async function scheduleWeightReminders(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const settings = await getNotificationSettings();
    if (!settings.weightReminders) {
      console.log('[Notifications] Weight reminders disabled');
      return;
    }

    const [morningHour, morningMinute] = settings.morningWeightTime.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚖️ Ranní vážení',
        body: 'Nezapomeň se zvážit na lačno',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: morningHour,
        minute: morningMinute,
        repeats: true,
      },
    });

    const [eveningHour, eveningMinute] = settings.eveningWeightTime.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚖️ Večerní vážení',
        body: 'Čas na večerní kontrolu váhy',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: eveningHour,
        minute: eveningMinute,
        repeats: true,
      },
    });

    console.log('[Notifications] Weight reminders scheduled');
  } catch (error) {
    console.error('[Notifications] Error scheduling weight reminders:', error);
  }
}

export async function scheduleAllReminders(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('[Notifications] Cannot schedule reminders without permissions');
    return;
  }

  await scheduleWaterReminders();
  await scheduleMealReminders();
  await scheduleWeightReminders();
  console.log('[Notifications] All reminders scheduled');
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All reminders cancelled');
  } catch (error) {
    console.error('[Notifications] Error cancelling reminders:', error);
  }
}

export async function sendTestNotification(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Notifikace fungují!',
        body: 'Tvoje připomínky jsou nastaveny',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
    console.log('[Notifications] Test notification scheduled');
  } catch (error) {
    console.error('[Notifications] Error sending test notification:', error);
  }
}
