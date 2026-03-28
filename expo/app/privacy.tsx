import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Shield } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function PrivacyScreen() {
  const { t } = useApp();

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Shield size={48} color={Colors.gold} />
          <Text style={styles.title}>{t.privacy.title}</Text>
          <Text style={styles.lastUpdated}>{t.privacy.lastUpdated}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.privacy.sections.collection.title}</Text>
          <Text style={styles.sectionText}>
            {t.privacy.sections.collection.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.privacy.sections.usage.title}</Text>
          <Text style={styles.sectionText}>
            {t.privacy.sections.usage.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.privacy.sections.storage.title}</Text>
          <Text style={styles.sectionText}>
            {t.privacy.sections.storage.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.privacy.sections.sharing.title}</Text>
          <Text style={styles.sectionText}>
            {t.privacy.sections.sharing.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.privacy.sections.rights.title}</Text>
          <Text style={styles.sectionText}>
            {t.privacy.sections.rights.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.privacy.sections.children.title}</Text>
          <Text style={styles.sectionText}>
            {t.privacy.sections.children.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.privacy.sections.changes.title}</Text>
          <Text style={styles.sectionText}>
            {t.privacy.sections.changes.text}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.privacy.sections.contact.title}</Text>
          <Text style={styles.sectionText}>
            {t.privacy.sections.contact.text}
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
