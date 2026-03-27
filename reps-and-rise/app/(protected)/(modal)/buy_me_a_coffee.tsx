import { SectionHeader } from '@/components/SectionHeader';
import { openDonationCheckout } from '@/lib/donations';
import { useThemeMode } from '@/theme/ThemeContext';
import { useCallback, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';

type DonationTier = {
  id: string;
  title: string;
  amountLabel: string;
  description: string;
};

const tiers: DonationTier[] = [
  {
    id: 'coffee',
    title: 'Coffee',
    amountLabel: '$3',
    description: 'A quick boost to support ongoing app improvements.',
  },
  {
    id: 'spotter',
    title: 'Spotter',
    amountLabel: '$10',
    description: 'Helps fund new features and smoother releases.',
  },
  {
    id: 'champion',
    title: 'Champion',
    amountLabel: '$25',
    description: 'Supports bigger roadmap milestones and quality upgrades.',
  },
  {
    id: 'legend',
    title: 'Legend',
    amountLabel: '$50',
    description: 'A major contribution to accelerate long-term development.',
  },
];

export default function BuyMeACoffeeModal() {
  const posthog = usePostHog();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  const [selectedTier, setSelectedTier] = useState<DonationTier>(tiers[1]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'buy_me_a_coffee_modal', section: 'modal' });
    }, [posthog])
  );

  const handleDonate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    posthog.capture('button_click', {
      screen: 'buy_me_a_coffee_modal',
      button: 'donate_via_stripe',
      tier_id: selectedTier.id,
      tier_amount: selectedTier.amountLabel,
    });

    try {
      const result = await openDonationCheckout(selectedTier.id);

      if (result.ok) {
        return;
      }

      if (result.reason === 'not-configured') {
        Alert.alert(
          'Stripe not connected yet',
          'Add EXPO_PUBLIC_STRIPE_DONATION_URL to your environment when Stripe Checkout is ready.'
        );
        return;
      }

      if (result.reason === 'invalid-url') {
        Alert.alert('Invalid Stripe URL', 'Please verify EXPO_PUBLIC_STRIPE_DONATION_URL in your env file.');
        return;
      }

      Alert.alert('Could not open checkout', 'Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SectionHeader title='Buy Me a Coffee' />
        <Text style={styles.subtitle}>Choose a donation tier to support development.</Text>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              We are committed to keeping this app free for everyone. If you enjoy using it, any support is deeply appreciated and helps us keep building new features for the community.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Donation Tiers</Text>
            {tiers.map((tier) => {
              const isSelected = selectedTier.id === tier.id;
              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[styles.tierRow, isSelected && styles.tierRowSelected]}
                  onPress={() => {
                    posthog.capture('donation_tier_selected', { tier_id: tier.id, tier_amount: tier.amountLabel });
                    setSelectedTier(tier);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.tierTextWrap}>
                    <Text style={styles.tierTitle}>{tier.title}</Text>
                    <Text style={styles.tierDescription}>{tier.description}</Text>
                  </View>
                  <Text style={[styles.tierAmount, isSelected && styles.tierAmountSelected]}>{tier.amountLabel}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Stripe Connection</Text>
            <Text style={styles.infoText}>This button is already wired for Stripe Checkout. Once configured, it opens your Stripe payment page with the selected tier attached as a query parameter.</Text>
            <Text style={styles.infoText}>Setup later by adding EXPO_PUBLIC_STRIPE_DONATION_URL in your .env.local file.</Text>

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              onPress={handleDonate}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Opening checkout...' : `Donate ${selectedTier.amountLabel} via Stripe`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
    },
    subtitle: {
      color: theme.colors.subtext,
      fontSize: theme.font.small,
      marginBottom: theme.spacing.sm,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
      rowGap: theme.spacing.sm,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      rowGap: theme.spacing.xs,
    },
    messageCard: {
      backgroundColor: theme.colors.iconBackground,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    messageText: {
      color: theme.colors.text,
      fontSize: theme.font.small,
      lineHeight: 21,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: theme.font.body,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
    },
    tierRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
      backgroundColor: theme.colors.background,
      columnGap: theme.spacing.sm,
    },
    tierRowSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.iconBackground,
    },
    tierTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    tierTitle: {
      color: theme.colors.text,
      fontSize: theme.font.body,
      fontWeight: '600',
    },
    tierDescription: {
      color: theme.colors.subtext,
      fontSize: theme.font.small,
      marginTop: theme.spacing.xs,
    },
    tierAmount: {
      color: theme.colors.text,
      fontSize: theme.font.subtitle,
      fontWeight: '700',
    },
    tierAmountSelected: {
      color: theme.colors.primary,
    },
    infoText: {
      color: theme.colors.subtext,
      fontSize: theme.font.small,
      lineHeight: 20,
    },
    primaryButton: {
      marginTop: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonDisabled: {
      opacity: 0.75,
    },
    primaryButtonText: {
      color: theme.colors.background,
      fontSize: theme.font.body,
      fontWeight: '700',
    },
  });
