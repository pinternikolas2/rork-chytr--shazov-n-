import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSettings {
  waterReminders: boolean;
  waterInterval: number;
  mealReminders: boolean;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  weightReminders: boolean;
  morningWeightTime: string;
  eveningWeightTime: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  waterReminders: true,
  waterInterval: 2,
  mealReminders: true,
  breakfastTime: '08:00',
  lunchTime: '12:30',
  dinnerTime: '18:30',
  weightReminders: true,
  morningWeightTime: '07:00',
  eveningWeightTime: '21:00',
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

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }



  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Notifications] Permission denied');
    return false;
  }

  return true;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('[Notifications] Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('[Notifications] Settings saved:', updated);
  } catch (error) {
    console.error('[Notifications] Error saving settings:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled');
  } catch (error) {
    console.error('[Notifications] Error cancelling notifications:', error);
  }
}

function parseTime(timeString: string): { hour: number; minute: number } {
  const [hourStr, minuteStr] = timeString.split(':');
  return {
    hour: parseInt(hourStr, 10),
    minute: parseInt(minuteStr, 10),
  };
}

async function scheduleNotification(
  title: string,
  body: string,
  hour: number,
  minute: number
): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    console.log(`[Notifications] Scheduled: ${title} at ${hour}:${minute}`);
  } catch (error) {
    console.error('[Notifications] Error scheduling notification:', error);
  }
}

async function scheduleWaterReminders(intervalHours: number): Promise<void> {
  if (Platform.OS === 'web') return;

  const startHour = 8;
  const endHour = 22;

  for (let hour = startHour; hour < endHour; hour += intervalHours) {
    await scheduleNotification(
      '💧 Čas na vodu!',
      'Nezapomeň se napít. Udržuj pravidelnou hydrataci.',
      hour,
      0
    );
  }
}

export async function scheduleAllReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform, skipping notifications');
    return;
  }

  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    console.log('[Notifications] No permission, skipping schedule');
    return;
  }

  await cancelAllNotifications();

  const settings = await getNotificationSettings();

  if (settings.waterReminders) {
    await scheduleWaterReminders(settings.waterInterval);
  }

  if (settings.mealReminders) {
    const breakfast = parseTime(settings.breakfastTime);
    await scheduleNotification(
      '🍳 Čas na snídani!',
      'Nezapomeň zaznamenat svou snídani.',
      breakfast.hour,
      breakfast.minute
    );

    const lunch = parseTime(settings.lunchTime);
    await scheduleNotification(
      '🍽️ Čas na oběd!',
      'Nezapomeň zaznamenat svůj oběd.',
      lunch.hour,
      lunch.minute
    );

    const dinner = parseTime(settings.dinnerTime);
    await scheduleNotification(
      '🥗 Čas na večeři!',
      'Nezapomeň zaznamenat svou večeři.',
      dinner.hour,
      dinner.minute
    );
  }

  if (settings.weightReminders) {
    const morning = parseTime(settings.morningWeightTime);
    await scheduleNotification(
      '⚖️ Ranní vážení',
      'Čas na ranní vážení. Nezapomeň zaznamenat svou váhu.',
      morning.hour,
      morning.minute
    );

    const evening = parseTime(settings.eveningWeightTime);
    await scheduleNotification(
      '⚖️ Večerní vážení',
      'Čas na večerní vážení. Nezapomeň zaznamenat svou váhu.',
      evening.hour,
      evening.minute
    );
  }

  console.log('[Notifications] All reminders scheduled');
}

export async function sendTestNotification(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform, test notification skipped');
    return;
  }

  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    console.log('[Notifications] No permission for test notification');
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Test notifikace',
        body: 'Notifikace fungují správně!',
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
