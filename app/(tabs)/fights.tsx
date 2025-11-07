import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Swords, Calendar, X, Trash2, Edit3 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { WeighInTiming, Discipline, DietType, TrainingIntensity } from '@/constants/types';


export default function FightsScreen() {
  const { t, fights, addFight, deleteFight, updateFight, profile, updateProfile } = useApp();
  const insets = useSafeAreaInsets();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFight, setEditingFight] = useState<string | null>(null);
  
  const [fightName, setFightName] = useState('');
  const [opponent, setOpponent] = useState('');
  const [weightClass, setWeightClass] = useState('');
  const [targetWeightForFight, setTargetWeightForFight] = useState('');
  const [fightDate, setFightDate] = useState('');
  const [weighInTiming, setWeighInTiming] = useState<WeighInTiming>('dayBefore');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<'GWL' | 'RWL' | 'REGEN'>('GWL');

  const [currentWeight, setCurrentWeight] = useState(
    profile && profile.role === 'fighter' ? profile.currentWeight.toString() : ''
  );

  const [discipline, setDiscipline] = useState<Discipline>(profile?.discipline || 'mma');
  const [dietType, setDietType] = useState<DietType>(
    profile && profile.role === 'fighter' ? profile.dietType : 'standard'
  );
  const [trainingIntensity, setTrainingIntensity] = useState<TrainingIntensity>(
    profile && profile.role === 'fighter' ? profile.trainingIntensity : 'moderate'
  );
  const [trainingsPerWeek, setTrainingsPerWeek] = useState(
    profile && profile.role === 'fighter' && profile.trainingsPerWeek
      ? profile.trainingsPerWeek.toString()
      : ''
  );

  const disciplines: Discipline[] = ['mma', 'boxing', 'wrestling', 'bjj', 'muayThai', 'kickboxing'];
  const dietTypes: DietType[] = ['standard', 'keto', 'paleo', 'vegetarian', 'vegan', 'other'];
  const trainingIntensities: TrainingIntensity[] = ['low', 'moderate', 'high', 'professional'];

  const resetForm = () => {
    setEditingFight(null);
    setFightName('');
    setOpponent('');
    setWeightClass('');
    setTargetWeightForFight('');
    setFightDate('');
    setWeighInTiming('dayBefore');
    setLocation('');
    setNotes('');
    setSelectedPhase('GWL');
    setCurrentWeight(profile && profile.role === 'fighter' ? profile.currentWeight.toString() : '');
    setDiscipline(profile?.discipline || 'mma');
    setDietType(profile && profile.role === 'fighter' ? profile.dietType : 'standard');
    setTrainingIntensity(profile && profile.role === 'fighter' ? profile.trainingIntensity : 'moderate');
    setTrainingsPerWeek(
      profile && profile.role === 'fighter' && profile.trainingsPerWeek
        ? profile.trainingsPerWeek.toString()
        : ''
    );
  };

  const openAddModal = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const openEditModal = (fight: any) => {
    setEditingFight(fight.id);
    setFightName(fight.name);
    setOpponent(fight.opponent);
    setWeightClass(fight.weightClass);
    setTargetWeightForFight(fight.targetWeightForFight.toString());
    const fightDateObj = new Date(fight.date);
    setFightDate(`${fightDateObj.getDate()}/${fightDateObj.getMonth() + 1}/${fightDateObj.getFullYear()}`);
    setWeighInTiming(fight.weighInTiming);
    setLocation(fight.location || '');
    setNotes(fight.notes || '');
    setSelectedPhase(fight.selectedPhase || 'GWL');
    
    setCurrentWeight(profile && profile.role === 'fighter' ? profile.currentWeight.toString() : '');
    setDiscipline(profile?.discipline || 'mma');
    setDietType(profile && profile.role === 'fighter' ? profile.dietType : 'standard');
    setTrainingIntensity(profile && profile.role === 'fighter' ? profile.trainingIntensity : 'moderate');
    setTrainingsPerWeek(
      profile && profile.role === 'fighter' && profile.trainingsPerWeek
        ? profile.trainingsPerWeek.toString()
        : ''
    );
    
    setIsModalVisible(true);
  };

  const handleSaveFight = async () => {
    if (!fightName || !fightDate || !targetWeightForFight) return;

    const dateParts = fightDate.split('/');
    let date: Date;
    
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      date = new Date(year, month, day);
    } else {
      date = new Date(fightDate);
    }

    const parsedCurrentWeight = parseFloat(currentWeight);
    const parsedTargetWeight = parseFloat(targetWeightForFight);
    const parsedTrainingsPerWeek = parseInt(trainingsPerWeek);

    if (
      isNaN(parsedCurrentWeight) ||
      isNaN(parsedTargetWeight) ||
      isNaN(parsedTrainingsPerWeek) ||
      parsedTrainingsPerWeek < 1 ||
      parsedTrainingsPerWeek > 14
    ) {
      Alert.alert('Chyba', 'Prosím vyplňte všechny hodnoty správně');
      return;
    }

    if (editingFight) {
      await updateFight(editingFight, {
        name: fightName,
        opponent: opponent || 'TBD',
        weightClass: weightClass || 'N/A',
        targetWeightForFight: parsedTargetWeight,
        date,
        weighInTiming,
        location,
        notes,
        selectedPhase,
      });
    } else {
      await addFight({
        name: fightName,
        opponent: opponent || 'TBD',
        weightClass: weightClass || 'N/A',
        targetWeightForFight: parsedTargetWeight,
        date,
        weighInTiming,
        location,
        notes,
        selectedPhase,
      });
    }

    if (profile) {
      await updateProfile({
        currentWeight: parsedCurrentWeight,
        targetWeight: parsedTargetWeight,
        weightClass: `${parsedTargetWeight} kg`,
        targetFightDate: date,
        discipline,
        dietType,
        trainingIntensity,
        trainingsPerWeek: parsedTrainingsPerWeek,
      });
    }

    resetForm();
    setIsModalVisible(false);
  };

  const upcomingFights = fights.filter((f) => f.date > new Date()).sort((a, b) => a.date.getTime() - b.date.getTime());
  const pastFights = fights.filter((f) => f.date <= new Date()).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>{t.fights.title}</Text>
        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Plus size={24} color={Colors.black} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.fights.upcoming}</Text>
          {upcomingFights.length === 0 ? (
            <View style={styles.emptyCard}>
              <Swords size={48} color={Colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.emptyText}>{t.dashboard.noFight}</Text>
              <Pressable style={styles.emptyButton} onPress={openAddModal}>
                <Text style={styles.emptyButtonText}>{t.fights.addFight}</Text>
              </Pressable>
            </View>
          ) : (
            upcomingFights.map((fight) => {
              const daysUntil = Math.ceil((fight.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <View key={fight.id} style={styles.fightCard}>
                  <View style={styles.fightCardHeader}>
                    <View style={styles.fightInfo}>
                      <Text style={styles.fightName}>{fight.name}</Text>
                      <Text style={styles.fightOpponent}>vs {fight.opponent}</Text>
                      {fight.selectedPhase && (
                        <View style={[
                          styles.phaseBadge,
                          fight.selectedPhase === 'GWL' && styles.phaseBadgeGWL,
                          fight.selectedPhase === 'RWL' && styles.phaseBadgeRWL,
                          fight.selectedPhase === 'REGEN' && styles.phaseBadgeREGEN,
                        ]}>
                          <Text style={styles.phaseBadgeText}>{fight.selectedPhase}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.daysContainer}>
                      <Text style={styles.daysNumber}>{daysUntil}</Text>
                      <Text style={styles.daysLabel}>{t.common.days}</Text>
                    </View>
                  </View>
                  <View style={styles.fightDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>{fight.date.toLocaleDateString()}</Text>
                    </View>
                    {fight.weightClass && (
                      <Text style={styles.detailText}>{fight.weightClass}</Text>
                    )}
                    {fight.location && (
                      <Text style={styles.detailText}>{fight.location}</Text>
                    )}
                  </View>
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => openEditModal(fight)}
                    >
                      <Edit3 size={18} color={Colors.gold} />
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => deleteFight(fight.id)}
                    >
                      <Trash2 size={18} color={Colors.error} />
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {pastFights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.fights.past}</Text>
            {pastFights.map((fight) => (
              <View key={fight.id} style={[styles.fightCard, styles.pastFightCard]}>
                <View style={styles.fightCardHeader}>
                  <View style={styles.fightInfo}>
                    <Text style={styles.fightName}>{fight.name}</Text>
                    <Text style={styles.fightOpponent}>vs {fight.opponent}</Text>
                  </View>
                </View>
                <View style={styles.fightDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>{fight.date.toLocaleDateString()}</Text>
                  </View>
                  {fight.weightClass && (
                    <Text style={styles.detailText}>{fight.weightClass}</Text>
                  )}
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteFight(fight.id)}
                >
                  <Trash2 size={18} color={Colors.error} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          resetForm();
          setIsModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={[
                styles.modalContent,
                { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingFight ? 'Upravit zápas' : t.fights.addFight}
                </Text>
                <Pressable onPress={() => {
                  resetForm();
                  setIsModalVisible(false);
                }}>
                  <X size={28} color={Colors.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.form}>
                <Text style={styles.sectionHeaderText}>Informace o zápasu</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.fights.fightName}</Text>
                  <TextInput
                    style={styles.input}
                    value={fightName}
                    onChangeText={setFightName}
                    placeholder="UFC 300"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.fights.opponent}</Text>
                  <TextInput
                    style={styles.input}
                    value={opponent}
                    onChangeText={setOpponent}
                    placeholder="John Doe"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.fights.weightClass}</Text>
                  <TextInput
                    style={styles.input}
                    value={weightClass}
                    onChangeText={setWeightClass}
                    placeholder="77kg"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cílová váha pro zápas (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={targetWeightForFight}
                    onChangeText={setTargetWeightForFight}
                    placeholder="77.0"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.fights.date}</Text>
                  <TextInput
                    style={styles.input}
                    value={fightDate}
                    onChangeText={setFightDate}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.fights.weighInTiming}</Text>
                  <View style={styles.timingButtons}>
                    <Pressable
                      style={[styles.timingButton, weighInTiming === 'dayBefore' && styles.timingButtonActive]}
                      onPress={() => setWeighInTiming('dayBefore')}
                    >
                      <Text style={[styles.timingButtonText, weighInTiming === 'dayBefore' && styles.timingButtonTextActive]}>
                        {t.fights.weighInTimings.dayBefore}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.timingButton, weighInTiming === 'dayOf' && styles.timingButtonActive]}
                      onPress={() => setWeighInTiming('dayOf')}
                    >
                      <Text style={[styles.timingButtonText, weighInTiming === 'dayOf' && styles.timingButtonTextActive]}>
                        {t.fights.weighInTimings.dayOf}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.fights.location}</Text>
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Prague, Czech Republic"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Poznámky</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Další informace o zápasu..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Fáze přípravy</Text>
                  <View style={styles.phaseButtons}>
                    <Pressable
                      style={[styles.phaseButton, selectedPhase === 'GWL' && styles.phaseButtonGWL]}
                      onPress={() => setSelectedPhase('GWL')}
                    >
                      <Text style={[styles.phaseButtonText, selectedPhase === 'GWL' && styles.phaseButtonTextActive]}>
                        GWL
                      </Text>
                      <Text style={[styles.phaseButtonSubtext, selectedPhase === 'GWL' && styles.phaseButtonSubtextActive]}>
                        Dlouhodobé
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.phaseButton, selectedPhase === 'RWL' && styles.phaseButtonRWL]}
                      onPress={() => setSelectedPhase('RWL')}
                    >
                      <Text style={[styles.phaseButtonText, selectedPhase === 'RWL' && styles.phaseButtonTextActive]}>
                        RWL
                      </Text>
                      <Text style={[styles.phaseButtonSubtext, selectedPhase === 'RWL' && styles.phaseButtonSubtextActive]}>
                        Akutní
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.phaseButton, selectedPhase === 'REGEN' && styles.phaseButtonREGEN]}
                      onPress={() => setSelectedPhase('REGEN')}
                    >
                      <Text style={[styles.phaseButtonText, selectedPhase === 'REGEN' && styles.phaseButtonTextActive]}>
                        REGEN
                      </Text>
                      <Text style={[styles.phaseButtonSubtext, selectedPhase === 'REGEN' && styles.phaseButtonSubtextActive]}>
                        Obnova
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.dividerLine} />

                <Text style={styles.sectionHeaderText}>Údaje pro měření a výpočty</Text>
                <Text style={styles.sectionSubtext}>
                  Tyto údaje se použijí pro plánování zápasu a výpočet denních cílů
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Aktuální váha (kg)</Text>
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
                  <Text style={styles.label}>Disciplína</Text>
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
                  <Text style={styles.label}>Typ stravy</Text>
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
                  <Text style={styles.label}>Intenzita tréninku</Text>
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
                  <Text style={styles.label}>Počet tréninků týdně</Text>
                  <TextInput
                    style={styles.input}
                    value={trainingsPerWeek}
                    onChangeText={setTrainingsPerWeek}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.textLight}
                    placeholder="6"
                  />
                </View>
              </View>

              <Pressable
                style={[styles.saveButton, (!fightName || !fightDate || !targetWeightForFight) && styles.saveButtonDisabled]}
                onPress={handleSaveFight}
                disabled={!fightName || !fightDate || !targetWeightForFight}
              >
                <Text style={styles.saveButtonText}>{t.common.save}</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  fightCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.gold,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pastFightCard: {
    borderColor: Colors.border.light,
    opacity: 0.7,
  },
  fightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 80,
  },
  fightInfo: {
    flex: 1,
  },
  fightName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  fightOpponent: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  daysContainer: {
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  daysLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  fightDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionButtons: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  form: {
    gap: 20,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 8,
  },
  sectionSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: -12,
    lineHeight: 20,
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
  saveButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  timingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timingButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  timingButtonActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.lightGray,
  },
  timingButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  timingButtonTextActive: {
    color: Colors.gold,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
    paddingTop: 12,
  },
  dividerLine: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 8,
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
  phaseButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  phaseButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  phaseButtonGWL: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  phaseButtonRWL: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  phaseButtonREGEN: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  phaseButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  phaseButtonTextActive: {
    color: Colors.textPrimary,
  },
  phaseButtonSubtext: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  phaseButtonSubtextActive: {
    color: Colors.textSecondary,
  },
  phaseBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  phaseBadgeGWL: {
    backgroundColor: '#10B981',
  },
  phaseBadgeRWL: {
    backgroundColor: '#F59E0B',
  },
  phaseBadgeREGEN: {
    backgroundColor: '#3B82F6',
  },
  phaseBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.white,
    textTransform: 'uppercase' as const,
  },
});
