import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Discipline, DietType, Gender, TrainingIntensity } from '@/constants/types';
import { useApp } from '@/contexts/AppContext';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { t, completeOnboarding } = useApp();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [weightClass, setWeightClass] = useState('');
  const [targetFightDate, setTargetFightDate] = useState('');
  const [discipline, setDiscipline] = useState<Discipline>('mma');
  const [dietType, setDietType] = useState<DietType>('standard');
  const [trainingIntensity, setTrainingIntensity] = useState<TrainingIntensity>('moderate');
  const [hasPreviousExperience, setHasPreviousExperience] = useState(false);
  const [trainerName, setTrainerName] = useState('');

  const disciplines: Discipline[] = ['mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing'];
  const genders: Gender[] = ['male', 'female'];
  const dietTypes: DietType[] = ['standard', 'keto', 'paleo', 'vegetarian', 'vegan', 'other'];
  const trainingIntensities: TrainingIntensity[] = ['low', 'moderate', 'high', 'professional'];

  const handleComplete = async () => {
    if (!fullName || !age || !height || !currentWeight || !targetWeight || !weightClass || !targetFightDate) {
      return;
    }

    const dateParts = targetFightDate.split('/');
    let fightDate: Date;
    
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      fightDate = new Date(year, month, day);
    } else {
      fightDate = new Date(targetFightDate);
    }

    await completeOnboarding({
      id: Date.now().toString(),
      role: 'fighter',
      fullName,
      age: parseInt(age, 10),
      height: parseInt(height, 10),
      gender,
      currentWeight: parseFloat(currentWeight),
      targetWeight: parseFloat(targetWeight),
      weightClass,
      discipline,
      dietType,
      trainingIntensity,
      hasPreviousExperience,
      trainerName: trainerName.trim() || undefined,
    });

    router.replace('/(tabs)');
  };

  const isValid =
    fullName.trim() !== '' &&
    age !== '' &&
    height !== '' &&
    currentWeight !== '' &&
    targetWeight !== '' &&
    weightClass.trim() !== '' &&
    targetFightDate.trim() !== '';

  return (
    <View style={[styles.container, { backgroundColor: Colors.white }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t.profile.title}</Text>
          <Text style={styles.subtitle}>{t.profile.personalInfo}</Text>

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
                  placeholder="25"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t.profile.height}</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="175"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.profile.gender}</Text>
              <View style={styles.buttonGrid}>
                {genders.map((g) => (
                  <Pressable
                    key={g}
                    style={[
                      styles.optionButton,
                      gender === g && styles.optionButtonActive,
                    ]}
                    onPress={() => setGender(g)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        gender === g && styles.optionTextActive,
                      ]}
                    >
                      {t.profile.genders[g]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t.profile.currentWeight}</Text>
                <TextInput
                  style={styles.input}
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                  placeholder="80.0"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t.profile.targetWeight}</Text>
                <TextInput
                  style={styles.input}
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  placeholder="77.0"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.profile.weightClass}</Text>
              <TextInput
                style={styles.input}
                value={weightClass}
                onChangeText={setWeightClass}
                placeholder="77 kg"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.profile.targetFightDate}</Text>
              <TextInput
                style={styles.input}
                value={targetFightDate}
                onChangeText={setTargetFightDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.profile.discipline}</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.profile.dietType}</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.profile.trainingIntensity}</Text>
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

            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>{t.profile.previousExperience}</Text>
                <Switch
                  value={hasPreviousExperience}
                  onValueChange={setHasPreviousExperience}
                  trackColor={{ false: Colors.mediumGray, true: Colors.gold }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.profile.trainerName}</Text>
              <TextInput
                style={styles.input}
                value={trainerName}
                onChangeText={setTrainerName}
                placeholder={t.profile.trainerName}
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>

          <Pressable
            style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
            onPress={handleComplete}
            disabled={!isValid}
          >
            <Text style={styles.saveButtonText}>{t.profile.save}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
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
    borderWidth: 1.5,
    borderColor: Colors.border.light,
  },
  optionButtonActive: {
    borderColor: Colors.black,
    backgroundColor: Colors.lightGray,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.black,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.black,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
