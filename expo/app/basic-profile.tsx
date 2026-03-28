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
import { ArrowLeft, User, Camera, Mail } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Discipline } from '@/constants/types';

export default function BasicProfileScreen() {
  const { t, profile, updateProfile } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [age, setAge] = useState(profile?.age.toString() || '');
  const [height, setHeight] = useState(profile?.height.toString() || '');
  const [discipline, setDiscipline] = useState<Discipline>(profile?.discipline || 'mma');

  const disciplines: Discipline[] = ['mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing'];

  const handleSave = async () => {
    if (!profile) return;

    try {
      const parsedAge = parseInt(age, 10);
      const parsedHeight = parseInt(height, 10);

      if (isNaN(parsedAge) || isNaN(parsedHeight)) {
        Alert.alert('Chyba', 'Prosím vyplňte všechny hodnoty správně');
        return;
      }

      await updateProfile({
        fullName,
        age: parsedAge,
        height: parsedHeight,
        discipline,
      });

      Alert.alert(t.common.success, 'Profil byl úspěšně aktualizován');
      router.back();
    } catch (error) {
      console.error('[BasicProfile] Error updating profile:', error);
      Alert.alert('Chyba', 'Nepodařilo se aktualizovat profil. Zkuste to prosím znovu.');
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Můj profil',
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
          <View style={styles.profileSection}>
            <Pressable style={styles.profileImageContainer}>
              <View style={styles.profileIconWrapper}>
                <User size={48} color={Colors.textSecondary} strokeWidth={1.5} />
              </View>
              <View style={styles.cameraIconWrapper}>
                <Camera size={16} color={Colors.white} strokeWidth={2.5} />
              </View>
            </Pressable>
            <Text style={styles.profileHint}>Klikněte pro změnu profilové fotky</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Základní údaje</Text>
            <View style={styles.card}>
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
                    placeholder="25"
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
                    placeholder="175"
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.profile.discipline}</Text>
            <View style={styles.card}>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: Colors.lightGray,
    position: 'relative' as const,
  },
  profileIconWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  cameraIconWrapper: {
    position: 'absolute' as const,
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
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
});
