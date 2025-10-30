import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function TermsScreen() {
  const { t } = useApp();

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <FileText size={48} color={Colors.gold} />
          <Text style={styles.title}>{t.terms.title}</Text>
          <Text style={styles.lastUpdated}>{t.terms.lastUpdated}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.acceptance.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.acceptance.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.license.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.license.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.disclaimer.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.disclaimer.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.responsibilities.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.responsibilities.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.subscription.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.subscription.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.prohibited.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.prohibited.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.liability.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.liability.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.termination.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.termination.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.law.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.law.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.terms.sections.contact.title}</Text>
          <Text style={styles.sectionText}>
            {t.terms.sections.contact.text}
          </Text>
          <Text style={styles.contactText}>support@chytre-shazovani.cz</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  sectionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  contactText: {
    fontSize: 15,
    color: Colors.gold,
    fontWeight: '600' as const,
    marginTop: 8,
  },
});
