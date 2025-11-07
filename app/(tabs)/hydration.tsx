import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Droplet, Droplets, AlertTriangle, Plus } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';


export default function HydrationScreen() {
  const { profile } = useApp();
  const insets = useSafeAreaInsets();
  const [waterAmount, setWaterAmount] = useState('');

  const hydrationLogs = trpc.hydrationLogs.list.useQuery(
    { userId: profile?.id || '' },
    { enabled: !!profile?.id }
  );
  
  const addLog = trpc.hydrationLogs.add.useMutation({
    onSuccess: () => {
      hydrationLogs.refetch();
      setWaterAmount('');
    },
  });

  const todayLogs = hydrationLogs.data?.filter((log: { date: Date }) => {
    const logDate = new Date(log.date);
    const today = new Date();
    return (
      logDate.getDate() === today.getDate() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getFullYear() === today.getFullYear()
    );
  });

  const todayTotal = todayLogs?.reduce((sum: number, log: { amount: number }) => sum + log.amount, 0) || 0;
  const dailyGoal = 3000;

  const handleAddWater = () => {
    const amount = parseFloat(waterAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Chyba', 'Zadejte platné množství vody');
      return;
    }

    if (!profile?.id) {
      Alert.alert('Chyba', 'Není přihlášen uživatel');
      return;
    }

    addLog.mutate({
      userId: profile.id,
      date: new Date(),
      amount,
    });
  };


  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Hydratace</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dailyOverviewCard}>
          <View style={styles.overviewHeader}>
            <Droplets size={28} color={Colors.gold} />
            <Text style={styles.overviewTitle}>Dnešní hydratace</Text>
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.progressAmount}>{todayTotal} ml</Text>
            <Text style={styles.progressGoal}>/ {dailyGoal} ml</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((todayTotal / dailyGoal) * 100, 100)}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.addCard}>
          <Text style={styles.addTitle}>Přidat vodu</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Množství (ml)"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              value={waterAmount}
              onChangeText={setWaterAmount}
            />
            <Pressable
              style={styles.addButton}
              onPress={handleAddWater}
              disabled={addLog.isPending}
            >
              {addLog.isPending ? (
                <Text style={styles.addButtonText}>...</Text>
              ) : (
                <Plus size={24} color={Colors.white} strokeWidth={2.5} />
              )}
            </Pressable>
          </View>
          <View style={styles.quickButtons}>
            {[250, 500, 750, 1000].map((amount) => (
              <Pressable
                key={amount}
                style={styles.quickButton}
                onPress={() => {
                  if (!profile?.id) {
                    Alert.alert('Chyba', 'Není přihlášen uživatel');
                    return;
                  }
                  addLog.mutate({
                    userId: profile.id,
                    date: new Date(),
                    amount,
                  });
                }}
              >
                <Text style={styles.quickButtonText}>+{amount}ml</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Dnešní záznamy</Text>
          {todayLogs && todayLogs.length > 0 ? (
            todayLogs.map((log: { id?: string; amount: number; date: Date }, index: number) => (
              <View key={log.id || index} style={styles.logItem}>
                <View style={styles.logIcon}>
                  <Droplet size={20} color={Colors.gold} />
                </View>
                <View style={styles.logContent}>
                  <Text style={styles.logAmount}>{log.amount} ml</Text>
                  <Text style={styles.logTime}>
                    {new Date(log.date).toLocaleTimeString('cs-CZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>Zatím žádné záznamy</Text>
            </View>
          )}
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <AlertTriangle size={20} color="#3B82F6" />
            <Text style={styles.tipsTitle}>Tipy pro správnou hydrataci</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Pijte pravidelně během celého dne</Text>
            <Text style={styles.tipItem}>• Vodu pijte před, během a po tréninku</Text>
            <Text style={styles.tipItem}>• Sledujte barvu moči - měla by být světle žlutá</Text>
            <Text style={styles.tipItem}>• Zvyšte příjem při vyšších teplotách</Text>
            <Text style={styles.tipItem}>• Minimálně 2-3L vody denně</Text>
          </View>
        </View>
      </ScrollView>


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

  dailyOverviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  progressAmount: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  progressGoal: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 6,
  },
  addCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
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
  addTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  addButton: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
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
  historyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logAmount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  logTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyHistory: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1E40AF',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 13,
    color: '#1E3A8A',
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
  waterInput: {
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
