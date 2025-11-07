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
import { Plus, Droplet, X, Droplets, AlertTriangle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { WeighInTiming, Discipline, DietType, TrainingIntensity } from '@/constants/types';


export default function HydrationScreen() {
  const { t, addFight, updateFight, profile, updateProfile, getUpcomingFight, getCurrentPhase } = useApp();
  const insets = useSafeAreaInsets();
  const upcomingFight = getUpcomingFight();
  const currentPhase = getCurrentPhase();

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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>RWL Protokol</Text>
        {!upcomingFight && (
          <Pressable style={styles.addButton} onPress={openAddModal}>
            <Plus size={24} color={Colors.black} />
          </Pressable>
        )}
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {!upcomingFight ? (
          <View style={styles.emptyCard}>
            <Droplet size={48} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.emptyText}>Nemáte aktivní cíl zápasu</Text>
            <Text style={styles.emptySubtext}>
              Přidejte cíl zápasu pro zobrazení RWL protokolu
            </Text>
            <Pressable style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>Přidat zápas</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Droplets size={24} color={Colors.gold} />
                <Text style={styles.infoTitle}>Protokol zavodnění/odvodnění</Text>
              </View>
              <Text style={styles.infoDescription}>
                RWL (Rapid Weight Loss) je vědecky podložená metoda shazování váhy pomocí manipulace s vodou a elektrolyty.
                {'\n\n'}
                Tento protokol vám pomůže bezpečně shodit 3-7% tělesné hmotnosti v posledních 7 dnech před vážením.
              </Text>
            </View>

            <View style={styles.phaseOverviewCard}>
              <Text style={styles.phaseOverviewTitle}>Fáze RWL protokolu</Text>
              
              <View style={styles.phaseItem}>
                <View style={[styles.phaseIcon, styles.phaseIconLoading]}>
                  <Text style={styles.phaseIconText}>1</Text>
                </View>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseItemTitle}>Loading (D-7 až D-5)</Text>
                  <Text style={styles.phaseItemDescription}>
                    Načtení vody a sodíku - pij 8L denně, vysoký příjem sodíku (5000mg)
                  </Text>
                </View>
              </View>

              <View style={styles.phaseItem}>
                <View style={[styles.phaseIcon, styles.phaseIconCutting]}>
                  <Text style={styles.phaseIconText}>2</Text>
                </View>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseItemTitle}>Cutting (D-4 až D-1)</Text>
                  <Text style={styles.phaseItemDescription}>
                    Postupné snižování vody a sodíku - spustí se přirozená diuréza
                  </Text>
                </View>
              </View>

              <View style={styles.phaseItem}>
                <View style={[styles.phaseIcon, styles.phaseIconRegen]}>
                  <Text style={styles.phaseIconText}>3</Text>
                </View>
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseItemTitle}>REGEN (Po vážení)</Text>
                  <Text style={styles.phaseItemDescription}>
                    Okamžitá rehydratace a obnova výkonu pro zápas
                  </Text>
                </View>
              </View>
            </View>

            {currentPhase && currentPhase.phase === 'WATER_CUT' && (
              <View style={styles.activePhaseCard}>
                <View style={styles.activePhaseHeader}>
                  <AlertTriangle size={20} color="#F59E0B" />
                  <Text style={styles.activePhaseTitle}>Jste v aktivní fázi RWL</Text>
                </View>
                <Text style={styles.activePhaseDescription}>
                  {currentPhase.description}
                </Text>
                <Text style={styles.activePhaseNote}>
                  Podrobné denní instrukce najdete na hlavní stránce v Dashboard
                </Text>
              </View>
            )}

            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <AlertTriangle size={20} color="#EF4444" />
                <Text style={styles.warningTitle}>Důležitá upozornění</Text>
              </View>
              <View style={styles.warningList}>
                <Text style={styles.warningItem}>• Nikdy neprovádějte RWL bez konzultace s odborníkem</Text>
                <Text style={styles.warningItem}>• Sledujte své tělo - při závratích OKAMŽITĚ přestaňte</Text>
                <Text style={styles.warningItem}>• Nepoužívejte saunu déle než 20min bez přestávky</Text>
                <Text style={styles.warningItem}>• Mějte trenéra/partnera poblíž během finální fáze</Text>
                <Text style={styles.warningItem}>• Při jakýchkoli zdravotních potížích vyhledejte lékaře</Text>
              </View>
            </View>
          </>
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
                  {editingFight ? 'Upravit zápas' : 'Přidat zápas'}
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
                  <Text style={styles.label}>Název zápasu</Text>
                  <TextInput
                    style={styles.input}
                    value={fightName}
                    onChangeText={setFightName}
                    placeholder="UFC 300"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Protivník</Text>
                  <TextInput
                    style={styles.input}
                    value={opponent}
                    onChangeText={setOpponent}
                    placeholder="John Doe"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Váhová kategorie</Text>
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
                  <Text style={styles.label}>Datum zápasu</Text>
                  <TextInput
                    style={styles.input}
                    value={fightDate}
                    onChangeText={setFightDate}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Čas vážení</Text>
                  <View style={styles.timingButtons}>
                    <Pressable
                      style={[styles.timingButton, weighInTiming === 'dayBefore' && styles.timingButtonActive]}
                      onPress={() => setWeighInTiming('dayBefore')}
                    >
                      <Text style={[styles.timingButtonText, weighInTiming === 'dayBefore' && styles.timingButtonTextActive]}>
                        Den před zápasem
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.timingButton, weighInTiming === 'dayOf' && styles.timingButtonActive]}
                      onPress={() => setWeighInTiming('dayOf')}
                    >
                      <Text style={[styles.timingButtonText, weighInTiming === 'dayOf' && styles.timingButtonTextActive]}>
                        V den zápasu
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Místo</Text>
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

                <View style={styles.phaseInfoContainer}>
                  <Text style={styles.phaseInfoTitle}>ℹ️ Informace o fázích</Text>
                  <Text style={styles.phaseInfoDescription}>
                    Aplikace automaticky určí, ve které fázi se nacházíte podle zbývajících dní do zápasu:
                    {'\n\n'}
                    • 8+ dní: Fáze hubnutí (GWL){'\n'}
                    • 7-1 dní: Fáze shazování vodou (RWL){'\n'}
                    • Po vážení: Fáze obnovy (REGEN)
                  </Text>
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
                <Text style={styles.saveButtonText}>Uložit</Text>
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
    color: Colors.textPrimary,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
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
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  phaseOverviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phaseOverviewTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  phaseItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  phaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  phaseIconLoading: {
    backgroundColor: '#10B981',
  },
  phaseIconCutting: {
    backgroundColor: '#F59E0B',
  },
  phaseIconRegen: {
    backgroundColor: '#3B82F6',
  },
  phaseIconText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  phaseContent: {
    flex: 1,
  },
  phaseItemTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  phaseItemDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  activePhaseCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  activePhaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  activePhaseTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#92400E',
  },
  activePhaseDescription: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 12,
  },
  activePhaseNote: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic' as const,
  },
  warningCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#991B1B',
  },
  warningList: {
    gap: 8,
  },
  warningItem: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 19,
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
  phaseInfoContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  phaseInfoTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0369A1',
    marginBottom: 8,
  },
  phaseInfoDescription: {
    fontSize: 13,
    color: '#075985',
    lineHeight: 19,
  },
});
