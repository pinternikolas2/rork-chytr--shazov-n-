import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Scale, Target, Activity } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Discipline, DietType, TrainingIntensity } from '@/constants/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function MeasurementSettingsScreen() {
  const { t, profile, updateProfile, settings } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [currentWeight, setCurrentWeight] = useState(
    profile && profile.role === 'fighter' ? profile.currentWeight.toString() : ''
  );
  const [targetWeight, setTargetWeight] = useState(
    profile && profile.role === 'fighter' ? profile.targetWeight.toString() : ''
  );
  const [weightClass, setWeightClass] = useState(
    profile && profile.role === 'fighter' ? profile.weightClass : ''
  );
  const [targetFightDate, setTargetFightDate] = useState<Date | null>(
    profile && profile.role === 'fighter' && profile.targetFightDate
      ? new Date(profile.targetFightDate)
      : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [discipline, setDiscipline] = useState<Discipline>(profile?.discipline || 'mma');
  const [dietType, setDietType] = useState<DietType>(
    profile && profile.role === 'fighter' ? profile.dietType : 'standard'
  );
  const [trainingIntensity, setTrainingIntensity] = useState<TrainingIntensity>(
    profile && profile.role === 'fighter' ? profile.trainingIntensity : 'moderate'
  );

  const disciplines: Discipline[] = ['mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing'];
  const dietTypes: DietType[] = ['standard', 'keto', 'paleo', 'vegetarian', 'vegan', 'other'];
  const trainingIntensities: TrainingIntensity[] = ['low', 'moderate', 'high', 'professional'];

  const handleSave = async () => {
    if (!profile) return;

    try {
      if (profile.role === 'fighter') {
        const parsedCurrentWeight = parseFloat(currentWeight);
        const parsedTargetWeight = parseFloat(targetWeight);

        if (
          isNaN(parsedCurrentWeight) ||
          isNaN(parsedTargetWeight) ||
          !weightClass ||
          !targetFightDate
        ) {
          Alert.alert('Chyba', 'Prosím vyplňte všechny hodnoty správně');
          return;
        }

        await updateProfile({
          currentWeight: parsedCurrentWeight,
          targetWeight: parsedTargetWeight,
          weightClass,
          targetFightDate,
          discipline,
          dietType,
          trainingIntensity,
        });
      }

      Alert.alert(t.common.success, 'Údaje pro měření byly úspěšně aktualizovány');
      router.back();
    } catch (error) {
      console.error('[MeasurementSettings] Error updating measurement settings:', error);
      Alert.alert('Chyba', 'Nepodařilo se aktualizovat údaje. Zkuste to prosím znovu.');
    }
  };

  if (!profile || profile.role !== 'fighter') {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Údaje pro měření',
          headerBackTitle: 'Zpět',
          headerStyle: {
            backgroundColor: Colors.white,
          },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                paddingLeft: 8,
                paddingRight: 16,
                opacity: pressed ? 0.6 : 1,
                marginLeft: 8,
                backgroundColor: pressed ? Colors.lightGray : 'transparent',
                borderRadius: 8,
                paddingVertical: 8,
              })}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={26} color={Colors.textPrimary} strokeWidth={2.5} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Scale size={32} color={Colors.gold} />
            <Text style={styles.headerTitle}>Nastavení pro výpočty</Text>
            <Text style={styles.headerSubtitle}>
              Tyto údaje se používají pro výpočet denních cílů, BMR, TDEE a plánování zápasů
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Váha a cíle</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.profile.currentWeight} (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textLight}
                  placeholder="80.0"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.profile.targetWeight} (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.textLight}
                  placeholder="77.0"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.profile.weightClass}</Text>
                <TextInput
                  style={styles.input}
                  value={weightClass}
                  onChangeText={setWeightClass}
                  placeholderTextColor={Colors.textLight}
                  placeholder="77 kg"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t.profile.targetFightDate}</Text>
                <Pressable
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={[
                      styles.datePickerText,
                      !targetFightDate && styles.datePickerPlaceholder,
                    ]}
                  >
                    {targetFightDate
                      ? targetFightDate.toLocaleDateString(
                          settings.language === 'cs' ? 'cs-CZ' : 'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )
                      : settings.language === 'cs'
                      ? 'Vyberte datum'
                      : 'Select date'}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={targetFightDate || new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      minimumDate={new Date()}
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === 'android') {
                          setShowDatePicker(false);
                          if (event.type === 'set' && selectedDate) {
                            setTargetFightDate(selectedDate);
                          }
                        } else if (Platform.OS === 'ios' && selectedDate) {
                          setTargetFightDate(selectedDate);
                        }
                      }}
                      locale={settings.language === 'cs' ? 'cs-CZ' : 'en-US'}
                      textColor={Colors.textPrimary}
                    />
                    {Platform.OS === 'ios' && (
                      <View style={styles.datePickerButtons}>
                        <Pressable
                          style={styles.datePickerCancelButton}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={styles.datePickerCancelText}>
                            {settings.language === 'cs' ? 'Zrušit' : 'Cancel'}
                          </Text>
                        </Pressable>
                        <Pressable
                          style={styles.datePickerConfirmButton}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={styles.datePickerConfirmText}>
                            {settings.language === 'cs' ? 'Potvrdit' : 'Confirm'}
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disciplína</Text>
            <View style={styles.card}>
              <View style={styles.buttonGrid}>
                {disciplines.map((disc) => (
                  <Pressable
                    key={disc}
                    style={[
                      styles.optionButton,
                      discipline === disc && styles.optionButtonActive,
                    ]}
                    onPress={() => setDiscipline(disc)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        discipline === disc && styles.optionTextActive,
                      ]}
                    >
                      {t.profile.disciplines[disc]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stravování</Text>
            <View style={styles.card}>
              <View style={styles.buttonGrid}>
                {dietTypes.map((diet) => (
                  <Pressable
                    key={diet}
                    style={[
                      styles.optionButton,
                      dietType === diet && styles.optionButtonActive,
                    ]}
                    onPress={() => setDietType(diet)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        dietType === diet && styles.optionTextActive,
                      ]}
                    >
                      {t.profile.dietTypes[diet]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intenzita tréninku</Text>
            <View style={styles.card}>
              <View style={styles.buttonGrid}>
                {trainingIntensities.map((intensity) => (
                  <Pressable
                    key={intensity}
                    style={[
                      styles.optionButton,
                      trainingIntensity === intensity && styles.optionButtonActive,
                    ]}
                    onPress={() => setTrainingIntensity(intensity)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        trainingIntensity === intensity && styles.optionTextActive,
                      ]}
                    >
                      {t.profile.trainingIntensities[intensity]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t.common.save}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
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
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  optionButtonActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.lightGray,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  optionTextActive: {
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
  datePickerButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  datePickerText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  datePickerPlaceholder: {
    color: Colors.textLight,
  },
  datePickerContainer: {
    marginTop: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden' as const,
  },
  datePickerButtons: {
    flexDirection: 'row' as const,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  datePickerCancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center' as const,
    borderRightWidth: 1,
    borderRightColor: Colors.border.light,
  },
  datePickerCancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  datePickerConfirmButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center' as const,
    backgroundColor: Colors.gold,
  },
  datePickerConfirmText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '700' as const,
  },
});
