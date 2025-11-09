import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Droplets, Plus, Trash2, Info, TrendingUp, Target, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function HydrationScreen() {
  const { 
    addHydrationLog, 
    deleteHydrationLog,
    getTodayHydration,
    getDailyHydrationGoal,
    hydrationLogs,
    getCurrentPhase,
    getRWLProtocol,
    getUpcomingFight,
  } = useApp();
  const insets = useSafeAreaInsets();

  const [waterInput, setWaterInput] = useState('');

  const todayHydration = getTodayHydration();
  const hydrationGoal = getDailyHydrationGoal();
  const currentPhase = getCurrentPhase();
  const upcomingFight = getUpcomingFight();

  const handleLogWater = async () => {
    if (!waterInput) return;
    const amount = parseInt(waterInput, 10);
    if (isNaN(amount)) return;
    
    await addHydrationLog(amount);
    setWaterInput('');
  };

  const quickSelectAmount = (amount: number) => {
    setWaterInput(amount.toString());
  };

  const getTodayLogs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return hydrationLogs
      .filter((log) => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const todayLogs = getTodayLogs();
  const progress = Math.min((todayHydration / hydrationGoal) * 100, 100);

  const getPhaseInfo = () => {
    if (!currentPhase || !upcomingFight) {
      return {
        title: 'Údržbový režim',
        description: 'Pij dostatek vody pro optimální výkon a regeneraci',
        color: Colors.gold,
        icon: '💧',
      };
    }

    const now = new Date();
    const daysUntilFight = Math.ceil((upcomingFight.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (currentPhase.phase === 'WATER_CUT') {
      const protocol = getRWLProtocol(daysUntilFight);
      if (protocol) {
        return {
          title: `Fáze ${protocol.phase === 'loading' ? 'Zavodňování' : protocol.phase === 'medium' ? 'Přechodná' : protocol.phase === 'cutting' ? 'Odvodňování' : 'Finální'}`,
          description: `D-${daysUntilFight}: ${protocol.waterTargetMl / 1000}L vody, ${protocol.sodiumTargetMg}mg sodíku`,
          color: protocol.phase === 'loading' ? '#3B82F6' : protocol.phase === 'medium' ? '#F59E0B' : protocol.phase === 'cutting' ? '#EF4444' : '#DC2626',
          icon: protocol.phase === 'loading' ? '💧' : protocol.phase === 'medium' ? '⚡' : protocol.phase === 'cutting' ? '🔥' : '🎯',
          protocol,
        };
      }
    }

    if (currentPhase.phase === 'RECOVERY') {
      return {
        title: 'Obnova výkonu',
        description: 'Rehydratace po vážení - maximální priorita',
        color: '#10B981',
        icon: '✨',
      };
    }

    return {
      title: 'Přípravná fáze',
      description: 'Udržuj stabilní hydrataci pro optimální výkon',
      color: Colors.gold,
      icon: '💪',
    };
  };

  const phaseInfo = getPhaseInfo();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <Droplets size={28} color={Colors.gold} strokeWidth={2.5} />
          <Text style={styles.headerTitle}>Hydratace</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.phaseCard, { backgroundColor: phaseInfo.color + '15', borderColor: phaseInfo.color }]}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseIcon}>{phaseInfo.icon}</Text>
              <View style={styles.phaseTextContainer}>
                <Text style={[styles.phaseTitle, { color: phaseInfo.color }]}>{phaseInfo.title}</Text>
                <Text style={styles.phaseDescription}>{phaseInfo.description}</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Dnešní hydratace</Text>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: phaseInfo.color }]} />
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{todayHydration}</Text>
                <Text style={styles.progressStatLabel}>Vypito (ml)</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>{hydrationGoal}</Text>
                <Text style={styles.progressStatLabel}>Cíl (ml)</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={[styles.progressStatValue, { color: phaseInfo.color }]}>
                  {Math.max(0, hydrationGoal - todayHydration)}
                </Text>
                <Text style={styles.progressStatLabel}>Zbývá (ml)</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Plus size={22} color={Colors.gold} strokeWidth={2.5} />
              <Text style={styles.cardTitle}>Přidat vodu</Text>
            </View>

            <View style={styles.quickButtons}>
              <Pressable
                style={[styles.quickButton, { borderColor: phaseInfo.color }]}
                onPress={() => quickSelectAmount(250)}
              >
                <Text style={[styles.quickButtonText, { color: phaseInfo.color }]}>250ml</Text>
              </Pressable>
              <Pressable
                style={[styles.quickButton, { borderColor: phaseInfo.color }]}
                onPress={() => quickSelectAmount(500)}
              >
                <Text style={[styles.quickButtonText, { color: phaseInfo.color }]}>500ml</Text>
              </Pressable>
              <Pressable
                style={[styles.quickButton, { borderColor: phaseInfo.color }]}
                onPress={() => quickSelectAmount(750)}
              >
                <Text style={[styles.quickButtonText, { color: phaseInfo.color }]}>750ml</Text>
              </Pressable>
              <Pressable
                style={[styles.quickButton, { borderColor: phaseInfo.color }]}
                onPress={() => quickSelectAmount(1000)}
              >
                <Text style={[styles.quickButtonText, { color: phaseInfo.color }]}>1L</Text>
              </Pressable>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={waterInput}
                onChangeText={setWaterInput}
                placeholder="Vlastní množství (ml)"
                placeholderTextColor={Colors.textLight}
                keyboardType="number-pad"
              />
              <Pressable
                style={[styles.addButton, !waterInput && styles.buttonDisabled, { backgroundColor: phaseInfo.color }]}
                onPress={handleLogWater}
                disabled={!waterInput}
              >
                <Plus size={20} color={Colors.white} strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>

          {phaseInfo.protocol && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Info size={22} color={Colors.gold} strokeWidth={2.5} />
                <Text style={styles.cardTitle}>Dnešní protokol</Text>
              </View>

              <View style={styles.protocolGrid}>
                <View style={styles.protocolItem}>
                  <Droplets size={18} color={phaseInfo.color} />
                  <Text style={styles.protocolValue}>{phaseInfo.protocol.waterTargetMl / 1000}L</Text>
                  <Text style={styles.protocolLabel}>Voda</Text>
                </View>
                <View style={styles.protocolItem}>
                  <Target size={18} color={phaseInfo.color} />
                  <Text style={styles.protocolValue}>{phaseInfo.protocol.sodiumTargetMg}mg</Text>
                  <Text style={styles.protocolLabel}>Sodík</Text>
                </View>
                <View style={styles.protocolItem}>
                  <Zap size={18} color={phaseInfo.color} />
                  <Text style={styles.protocolValue}>{phaseInfo.protocol.potassiumTargetMg}mg</Text>
                  <Text style={styles.protocolLabel}>Draslík</Text>
                </View>
              </View>

              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Pokyny:</Text>
                {phaseInfo.protocol.instructions.map((instruction, index) => (
                  <Text key={index} style={styles.instructionText}>• {instruction}</Text>
                ))}
              </View>

              {phaseInfo.protocol.warnings && phaseInfo.protocol.warnings.length > 0 && (
                <View style={styles.warningsContainer}>
                  <Text style={styles.warningsTitle}>⚠️ Upozornění:</Text>
                  {phaseInfo.protocol.warnings.map((warning, index) => (
                    <Text key={index} style={styles.warningText}>• {warning}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TrendingUp size={22} color={Colors.gold} strokeWidth={2.5} />
              <Text style={styles.cardTitle}>Dnešní záznamy ({todayLogs.length})</Text>
            </View>

            {todayLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Droplets size={48} color={Colors.textLight} strokeWidth={1.5} />
                <Text style={styles.emptyStateText}>Zatím žádné záznamy</Text>
                <Text style={styles.emptyStateSubtext}>Začni zaznamenávat hydrataci pomocí tlačítek výše</Text>
              </View>
            ) : (
              <View style={styles.logsList}>
                {todayLogs.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logItemContent}>
                      <View style={styles.logItemLeft}>
                        <View style={[styles.logItemDot, { backgroundColor: phaseInfo.color }]} />
                        <View>
                          <Text style={styles.logItemValue}>{log.amount} ml</Text>
                          <Text style={styles.logItemTime}>
                            {log.date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => {
                          Alert.alert(
                            'Smazat záznam',
                            'Opravdu chcete smazat tento záznam hydratace?',
                            [
                              { text: 'Zrušit', style: 'cancel' },
                              {
                                text: 'Smazat',
                                style: 'destructive',
                                onPress: async () => {
                                  await deleteHydrationLog(log.id);
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <Trash2 size={18} color="#EF4444" strokeWidth={2} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  phaseCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 2,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phaseIcon: {
    fontSize: 32,
  },
  phaseTextContainer: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  phaseDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.light,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderWidth: 2,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  protocolGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  protocolItem: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  protocolValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  protocolLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  instructionsContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  warningsContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#DC2626',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#DC2626',
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  logsList: {
    gap: 8,
  },
  logItem: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 12,
  },
  logItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logItemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  logItemValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  logItemTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
});
