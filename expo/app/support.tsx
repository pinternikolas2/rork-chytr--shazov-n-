import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert, Linking } from 'react-native';
import { Mail, MessageCircle, Book, ExternalLink } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function SupportScreen() {
  const { t } = useApp();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(t.support.error, t.support.errorFillFields);
      return;
    }

    const email = 'support@chytre-shazovani.cz';
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    
    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
        Alert.alert(t.support.successTitle, t.support.successMessage);
      } else {
        Alert.alert(t.support.error, t.support.errorOpenEmail);
      }
    } catch (error) {
      Alert.alert(t.support.error, t.support.errorGeneral);
    }
  };

  const openFAQ = () => {
    Alert.alert(t.support.faq, t.support.faqAlert);
  };

  const openDocs = () => {
    Alert.alert(t.support.documentation, t.support.docsAlert);
  };

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t.support.howCanWeHelp}</Text>
        <Text style={styles.subtitle}>
          {t.support.getInTouch}
        </Text>

        <View style={styles.quickLinksSection}>
          <Pressable style={styles.quickLink} onPress={openFAQ}>
            <View style={styles.quickLinkIcon}>
              <MessageCircle size={24} color={Colors.gold} />
            </View>
            <View style={styles.quickLinkContent}>
              <Text style={styles.quickLinkTitle}>{t.support.faq}</Text>
              <Text style={styles.quickLinkSubtitle}>{t.support.faqDescription}</Text>
            </View>
            <ExternalLink size={20} color={Colors.textSecondary} />
          </Pressable>

          <Pressable style={styles.quickLink} onPress={openDocs}>
            <View style={styles.quickLinkIcon}>
              <Book size={24} color={Colors.gold} />
            </View>
            <View style={styles.quickLinkContent}>
              <Text style={styles.quickLinkTitle}>{t.support.documentation}</Text>
              <Text style={styles.quickLinkSubtitle}>{t.support.documentationDescription}</Text>
            </View>
            <ExternalLink size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Mail size={24} color={Colors.gold} />
            <Text style={styles.contactTitle}>{t.support.contactSupport}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.support.subject}</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder={t.support.subjectPlaceholder}
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.support.message}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder={t.support.messagePlaceholder}
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <Pressable style={styles.sendButton} onPress={handleSendEmail}>
              <Mail size={20} color={Colors.black} />
              <Text style={styles.sendButtonText}>{t.support.sendEmail}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t.support.responseTime}</Text>
          <Text style={styles.infoText}>
            {t.support.responseTimeText}
          </Text>
        </View>

        <View style={styles.contactInfoSection}>
          <Text style={styles.contactInfoTitle}>{t.support.email}</Text>
          <Text style={styles.contactInfoText}>support@chytre-shazovani.cz</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  quickLinksSection: {
    gap: 12,
    marginBottom: 32,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 12,
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkContent: {
    flex: 1,
  },
  quickLinkTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  quickLinkSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  contactSection: {
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
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
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  infoSection: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  contactInfoSection: {
    marginBottom: 16,
  },
  contactInfoTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
  },
  contactInfoText: {
    fontSize: 16,
    color: Colors.gold,
    fontWeight: '600' as const,
  },
});
