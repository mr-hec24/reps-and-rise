import { Screen } from '@/components/Screen';
import { BackButton } from '@/components/ui-ember';
import { openDonationCheckout } from '@/lib/donations';
import { useThemeMode } from '@/theme/ThemeContext';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
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
        Alert.alert(
          'Invalid Stripe URL',
          'Please verify EXPO_PUBLIC_STRIPE_DONATION_URL in your env file.'
        );
        return;
      }

      Alert.alert('Could not open checkout', 'Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    posthog.capture('button_click', { screen: 'buy_me_a_coffee_modal', button: 'back' });
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={goBack} />
        <Text style={styles.headerTitle}>Buy me a coffee</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.container}>
        <Text style={styles.subtitle}>Choose a donation tier to support development.</Text>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              We are committed to keeping this app free for everyone. If you enjoy using it, any
              support is deeply appreciated and helps us keep building new features for the
              community.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Donation Tiers</Text>
            {tiers.map(tier => {
              const isSelected = selectedTier.id === tier.id;
              return (
                <TouchableOpacity
                  key={tier.id}
                  style={[styles.tierRow, isSelected && styles.tierRowSelected]}
                  onPress={() => {
                    posthog.capture('donation_tier_selected', {
                      tier_id: tier.id,
                      tier_amount: tier.amountLabel,
                    });
                    setSelectedTier(tier);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.tierTextWrap}>
                    <Text style={styles.tierTitle}>{tier.title}</Text>
                    <Text style={styles.tierDescription}>{tier.description}</Text>
                  </View>
                  <Text style={[styles.tierAmount, isSelected && styles.tierAmountSelected]}>
                    {tier.amountLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Stripe Connection</Text>
            <Text style={styles.infoText}>
              This button is already wired for Stripe Checkout. Once configured, it opens your
              Stripe payment page with the selected tier attached as a query parameter.
            </Text>
            <Text style={styles.infoText}>
              Setup later by adding EXPO_PUBLIC_STRIPE_DONATION_URL in your .env.local file.
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              onPress={handleDonate}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting
                  ? 'Opening checkout...'
                  : `Donate ${selectedTier.amountLabel} via Stripe`}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 12,
    },
    headerTitle: {
      flex: 1,
      fontFamily: theme.font.family.display,
      fontSize: 18,
      letterSpacing: -0.36,
      color: theme.colors.text,
    },
    headerSpacer: { width: 38 },
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    subtitle: {
      fontFamily: theme.font.family.body,
      color: theme.colors.subtext,
      fontSize: 13,
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
      fontFamily: theme.font.family.body,
      color: theme.colors.subtext,
      fontSize: 13.5,
      lineHeight: 21,
    },
    cardTitle: {
      fontFamily: theme.font.family.display,
      color: theme.colors.text,
      fontSize: 15,
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
      backgroundColor: theme.colors.surfaceSunken,
      columnGap: theme.spacing.sm,
    },
    tierRowSelected: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentSoft,
    },
    tierTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    tierTitle: {
      fontFamily: theme.font.family.display,
      color: theme.colors.text,
      fontSize: 15,
    },
    tierDescription: {
      fontFamily: theme.font.family.body,
      color: theme.colors.subtext,
      fontSize: 13,
      marginTop: theme.spacing.xs,
    },
    tierAmount: {
      fontFamily: theme.font.family.monoBold,
      color: theme.colors.text,
      fontSize: 18,
    },
    tierAmountSelected: {
      color: theme.colors.accent,
    },
    infoText: {
      fontFamily: theme.font.family.body,
      color: theme.colors.subtext,
      fontSize: 13,
      lineHeight: 20,
    },
    primaryButton: {
      marginTop: theme.spacing.sm,
      borderRadius: 15,
      backgroundColor: theme.colors.accent,
      paddingVertical: 15,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonDisabled: {
      opacity: 0.75,
    },
    primaryButtonText: {
      fontFamily: theme.font.family.displayBold,
      color: theme.colors.onAccent,
      fontSize: 15.5,
    },
  });
