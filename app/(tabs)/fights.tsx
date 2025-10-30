import { useState } from 'react';
import {
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
import { Plus, Swords, Calendar, X, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { WeighInTiming } from '@/constants/types';

export default function FightsScreen() {
  const { t, fights, addFight, deleteFight } = useApp();
  const insets = useSafeAreaInsets();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fightName, setFightName] = useState('');
  const [opponent, setOpponent] = useState('');
  const [weightClass, setWeightClass] = useState('');
  const [fightDate, setFightDate] = useState('');
  const [weighInTiming, setWeighInTiming] = useState<WeighInTiming>('dayBefore');
  const [location, setLocation] = useState('');

  const handleAddFight = async () => {
    if (!fightName || !fightDate) return;

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

    await addFight({
      name: fightName,
      opponent: opponent || 'TBD',
      weightClass: weightClass || 'N/A',
      date,
      weighInTiming,
      location,
    });

    setFightName('');
    setOpponent('');
    setWeightClass('');
    setFightDate('');
    setWeighInTiming('dayBefore');
    setLocation('');
    setIsModalVisible(false);
  };

  const upcomingFights = fights.filter((f) => f.date > new Date()).sort((a, b) => a.date.getTime() - b.date.getTime());
  const pastFights = fights.filter((f) => f.date <= new Date()).sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t.fights.title}</Text>
          <Pressable style={styles.addButton} onPress={() => setIsModalVisible(true)}>
            <Plus size={24} color={Colors.black} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.fights.upcoming}</Text>
          {upcomingFights.length === 0 ? (
            <View style={styles.emptyCard}>
              <Swords size={48} color={Colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.emptyText}>{t.dashboard.noFight}</Text>
              <Pressable style={styles.emptyButton} onPress={() => setIsModalVisible(true)}>
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
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteFight(fight.id)}
                  >
                    <Trash2 size={18} color={Colors.error} />
                  </Pressable>
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
        onRequestClose={() => setIsModalVisible(false)}
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
                <Text style={styles.modalTitle}>{t.fights.addFight}</Text>
                <Pressable onPress={() => setIsModalVisible(false)}>
                  <X size={28} color={Colors.textPrimary} />
                </Pressable>
              </View>

              <View style={styles.form}>
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
              </View>

              <Pressable
                style={[styles.saveButton, (!fightName || !fightDate) && styles.saveButtonDisabled]}
                onPress={handleAddFight}
                disabled={!fightName || !fightDate}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
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
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
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
});
