import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Droplet, Droplets, AlertTriangle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';


export default function HydrationScreen() {
  const { t, profile, getUpcomingFight, getCurrentPhase } = useApp();
  const insets = useSafeAreaInsets();
  const upcomingFight = getUpcomingFight();
  const currentPhase = getCurrentPhase();


  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Zavodnění a Odvodnění</Text>
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
              Přidejte cíl zápasu pro zobrazení protokolu zavodnění/odvodnění
            </Text>
            <Text style={styles.emptyNote}>
              Přidejte cíl zápasu na hlavní stránce
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Droplets size={24} color={Colors.gold} />
                <Text style={styles.infoTitle}>Protokol zavodnění/odvodnění</Text>
              </View>
              <Text style={styles.infoDescription}>
                Vědecky podložená metoda shazování váhy pomocí manipulace s vodou a elektrolyty.
                {'\n\n'}
                Tento protokol vám pomůže bezpečně shodit 3-7% tělesné hmotnosti v posledních 7 dnech před vážením.
              </Text>
            </View>

            <View style={styles.phaseOverviewCard}>
              <Text style={styles.phaseOverviewTitle}>Fáze protokolu</Text>
              
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
                  <Text style={styles.activePhaseTitle}>Jste v aktivní fázi shazování</Text>
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
                <Text style={styles.warningItem}>• Nikdy neprovádějte protokol bez konzultace s odborníkem</Text>
                <Text style={styles.warningItem}>• Sledujte své tělo - při závratích OKAMŽITĚ přestaňte</Text>
                <Text style={styles.warningItem}>• Nepoužívejte saunu déle než 20min bez přestávky</Text>
                <Text style={styles.warningItem}>• Mějte trenéra/partnera poblíž během finální fáze</Text>
                <Text style={styles.warningItem}>• Při jakýchkoli zdravotních potížích vyhledejte lékaře</Text>
              </View>
            </View>
          </>
        )}
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
  emptyNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic' as const,
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
