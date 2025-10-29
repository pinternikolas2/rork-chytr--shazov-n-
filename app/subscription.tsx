import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, Crown, Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function SubscriptionScreen() {
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const features = [
    'Unlimited weight tracking',
    'AI-powered recommendations',
    'Advanced hydration planning',
    'Scientific weight cut calculator',
    'Meal planning & logging',
    'Recovery optimization',
    'Priority support',
    'Export data & reports',
  ];

  const handleSubscribe = (type: 'monthly' | 'annual') => {
    console.log('Subscribe:', type);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.settings.subscription}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Crown size={48} color={Colors.gold} />
          <Text style={styles.heroTitle}>Go Premium</Text>
          <Text style={styles.heroSubtitle}>
            Unlock all features and take your weight cutting to the next level
          </Text>
        </View>

        <View style={styles.trialBanner}>
          <Calendar size={20} color={Colors.gold} />
          <Text style={styles.trialText}>7-day free trial • Cancel anytime</Text>
        </View>

        <View style={styles.plansSection}>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Monthly</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>149 Kč</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
            </View>
            <Pressable style={styles.subscribeButton} onPress={() => handleSubscribe('monthly')}>
              <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
            </Pressable>
          </View>

          <View style={[styles.planCard, styles.planCardPopular]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>BEST VALUE</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Annual</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>822 Kč</Text>
                <Text style={styles.pricePeriod}>/year</Text>
              </View>
              <Text style={styles.savingsText}>Save 54% • Only 69 Kč/month</Text>
            </View>
            <Pressable
              style={[styles.subscribeButton, styles.subscribeButtonPremium]}
              onPress={() => handleSubscribe('annual')}
            >
              <Text style={[styles.subscribeButtonText, styles.subscribeButtonTextPremium]}>
                Start Free Trial
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What&apos;s Included</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.checkIcon}>
                <Check size={18} color={Colors.white} />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.noteText}>
            • Payment will be charged to your account at the confirmation of purchase
          </Text>
          <Text style={styles.noteText}>
            • Subscription automatically renews unless auto-renew is turned off at least 24 hours
            before the end of the current period
          </Text>
          <Text style={styles.noteText}>
            • Your account will be charged for renewal within 24 hours prior to the end of the
            current period
          </Text>
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
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  trialText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  plansSection: {
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  planCardPopular: {
    borderColor: Colors.gold,
    backgroundColor: Colors.lightGray,
  },
  popularBadge: {
    position: 'absolute' as const,
    top: -12,
    right: 16,
    backgroundColor: Colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.black,
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  pricePeriod: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  savingsText: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '600' as const,
  },
  subscribeButton: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  subscribeButtonPremium: {
    backgroundColor: Colors.gold,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  subscribeButtonTextPremium: {
    color: Colors.black,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  notesSection: {
    gap: 8,
  },
  noteText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
