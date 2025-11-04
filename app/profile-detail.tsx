import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
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
import { ChevronRight, X, User, Camera } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Discipline } from '@/constants/types';

export default function ProfileDetailScreen() {
  const { t, profile, updateProfile, weightLogs } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [age, setAge] = useState(profile?.age.toString() || '');
  const [height, setHeight] = useState(profile?.height.toString() || '');
  const [currentWeight, setCurrentWeight] = useState(
    profile && profile.role === 'fighter' ? profile.currentWeight.toString() : ''
  );
  const [targetWeight, setTargetWeight] = useState(
    profile && profile.role === 'fighter' ? profile.targetWeight.toString() : ''
  );
  const [discipline, setDiscipline] = useState<Discipline>(profile?.discipline || 'mma');

  const disciplines: Discipline[] = ['mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing'];

  const handleProfileUpdate = async () => {
    if (!profile) return;

    try {
      if (profile.role === 'fighter') {
        const parsedAge = parseInt(age, 10);
        const parsedHeight = parseInt(height, 10);
        const parsedCurrentWeight = parseFloat(currentWeight);
        const parsedTargetWeight = parseFloat(targetWeight);

        if (
          isNaN(parsedAge) ||
          isNaN(parsedHeight) ||
          isNaN(parsedCurrentWeight) ||
          isNaN(parsedTargetWeight)
        ) {
          Alert.alert('Chyba', 'Prosím vyplňte všechny hodnoty správně');
          return;
        }

        await updateProfile({
          fullName,
          age: parsedAge,
          height: parsedHeight,
          currentWeight: parsedCurrentWeight,
          targetWeight: parsedTargetWeight,
          discipline,
        });
      } else {
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
      }

      Alert.alert(t.common.success, 'Profil byl úspěšně aktualizován');
      setIsProfileModalVisible(false);
    } catch (error) {
      console.error('[ProfileDetail] Error updating profile:', error);
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
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.fullName}</Text>
              <Text style={styles.profileSubtitle}>
                {profile.role === 'fighter' ? 'MMA zápasník' : 'Trenér'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Moje čísla</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCardHalf}>
                <Text style={styles.statLabel}>Aktuální váha</Text>
                <Text style={styles.statValue}>
                  {profile.role === 'fighter' ? `${profile.currentWeight} kg` : '— kg'}
                </Text>
              </View>
              <View style={styles.statCardHalf}>
                <Text style={styles.statLabel}>Cílová váha</Text>
                <Text style={styles.statValue}>
                  {profile.role === 'fighter' ? `${profile.targetWeight} kg` : '— kg'}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCardFull}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Startovací váha</Text>
                  <Text style={styles.statSecondary}>
                    {profile.role === 'fighter' && profile.startingWeight
                      ? new Date().toLocaleDateString('cs-CZ')
                      : ''}
                  </Text>
                </View>
                <Text style={styles.statValue}>
                  {profile.role === 'fighter' && profile.startingWeight
                    ? `${profile.startingWeight} kg`
                    : '— kg'}
                </Text>
              </View>
            </View>

            {profile.role === 'fighter' && weightLogs.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statCardFull}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Datum vážení</Text>
                    <Text style={styles.statSecondary}>
                      {new Date(weightLogs[weightLogs.length - 1].date).toLocaleDateString('cs-CZ')}
                    </Text>
                  </View>
                  <Text style={styles.statValue}>{weightLogs[weightLogs.length - 1].weight} kg</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Osobní údaje</Text>
            <View style={styles.personalInfoCard}>
              <View style={styles.personalInfoRow}>
                <Text style={styles.personalInfoLabel}>Věk</Text>
                <Text style={styles.personalInfoLabel}>Výška</Text>
              </View>
              <View style={styles.personalInfoRow}>
                <Text style={styles.personalInfoValue}>{profile.age}</Text>
                <Text style={styles.personalInfoValue}>{profile.height} cm</Text>
              </View>
            </View>

            <Pressable
              style={styles.editProfileButton}
              onPress={() => {
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
            >
              <Text style={styles.editProfileButtonText}>Upravit profil</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historie zápasů</Text>
            <Pressable
              style={styles.historyButton}
              onPress={() => router.push('/fights')}
            >
              <Text style={styles.historyButtonText}>Zobrazit historii</Text>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </ScrollView>

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

                {profile.role === 'fighter' && (
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
    marginBottom: 16,
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
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCardHalf: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardFull: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsRow: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statSecondary: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  personalInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  personalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  personalInfoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  personalInfoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  editProfileButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  historyButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingBottom: 20,
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
});
