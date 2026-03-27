import { SectionHeader } from '@/components/SectionHeader';
import { useThemeMode } from '@/theme/ThemeContext';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type PolicySection = {
  title: string;
  paragraphs: string[];
};

const policySections: PolicySection[] = [
  {
    title: '1. Introduction',
    paragraphs: [
      'Welcome to [App Name], a fitness tracking application developed and operated by Phoenix Soteria LLC ("we," "us," or "our"). We are committed to protecting your personal information and your right to privacy.',
      'This Privacy & Security Policy explains what information we collect, how we use it, who we share it with, and what rights you have regarding your data. By using the App, you agree to the practices described in this Policy. If you do not agree, please discontinue use of the App.',
    ],
  },
  {
    title: '2. Who We Are',
    paragraphs: [
      'Phoenix Soteria LLC is the data controller responsible for your personal information collected through the App. We are a United States-based company.',
      'If you have questions or concerns about this Policy, you may contact us at: Phoenix Soteria LLC, [Mailing Address - To Be Added], [Contact Email - To Be Added].',
    ],
  },
  {
    title: '3. Information We Collect',
    paragraphs: [
      'Information you provide directly includes account registration details (name and email), payment information handled by Stripe, and fitness/workout data you log (exercises, sets, reps, weights, and performance metrics).',
      'Information collected automatically includes usage and analytics data, device and technical diagnostics, and authentication tokens generated through Google or Apple SSO.',
      'Product Analytics (PostHog). We use PostHog to understand how users interact with the App and to improve reliability and features. PostHog may collect usage events (such as screen views, button taps, workout create/edit/delete actions, and settings changes), device and app metadata (such as device model, operating system, app version, locale, and timezone), and technical metadata (such as timestamps and approximate location inferred from IP). We configure analytics to avoid collecting sensitive health details beyond what is necessary to provide and improve core functionality. We do not use analytics data for targeted advertising and do not sell it to third parties.',
    ],
  },
  {
    title: '4. How We Use Your Information',
    paragraphs: [
      'We use your information to manage your account, authenticate identity, process payments, deliver workout tracking features, improve performance and user experience, communicate transactional updates, detect abuse/fraud, and comply with legal obligations.',
      'We do not sell your personal data and do not use it for targeted advertising.',
    ],
  },
  {
    title: '5. How We Share Your Information',
    paragraphs: [
      'We do not sell, rent, or trade your personal information. We share data only with trusted providers needed to run the App, including Stripe for payment processingand PostHog for product usage insights.',
      'We may also disclose information when legally required or when necessary to protect the rights, safety, or property of Phoenix Soteria LLC, our users, or the public.',
      'Service Provider Disclosure. We share analytics data with PostHog, our analytics processor, solely to provide analytics and product improvement services on our behalf. PostHog acts as a processor/service provider and is contractually restricted from using this data for unrelated purposes. We do not share analytics data with any other third parties, and we do not sell it. For more information on how PostHog handles data, please refer to their privacy policy at https://posthog.com/privacy.',
      'International Transfers. Analytics data may be processed in the United States, including by PostHog cloud infrastructure (us.i.posthog.com). Where required, we use appropriate safeguards for cross-border transfers.'
    ],
  },
  {
    title: '6. Data Retention',
    paragraphs: [
      'We retain personal information while your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal data within 30 days, except where legal retention requirements apply.',
      'Retention. Analytics event data is retained only as long as necessary for product analytics and operational purposes, then deleted or anonymized in accordance with our retention schedule. We do not retain analytics data for any longer than necessary and do not use it for any purpose other than improving the App.',
    ],
  },
  {
    title: '7. Data Security',
    paragraphs: [
      'We apply industry-standard safeguards including encryption in transit (TLS), encryption at rest for sensitive data, strict access controls, security monitoring, and secure password hashing.',
      'Google and Apple SSO authentication is managed by their platforms. While we use strong safeguards, no method of transmission or storage is fully secure, and we will provide notice as required by law if a qualifying breach occurs.',
    ],
  },
  {
    title: "8. Children's Privacy",
    paragraphs: [
      'The App is intended for users age 13 and older. We do not knowingly collect personal information from children under 13, and we will remove such data if discovered without required consent.',
    ],
  },
  {
    title: '9. Your Rights and Choices',
    paragraphs: [
      'Depending on your location, you may have rights to access, portability, correction, deletion, and analytics opt-out. California residents may have additional rights under CCPA. We do not sell personal information.',
      'To submit privacy requests, contact us using the details listed in this policy.',
    ],
  },
  {
    title: '10. Third-Party Links and Services',
    paragraphs: [
      'The App may include links to or integrations with third-party services (for example, Google or Apple sign-in, PostHog Analytics). This policy does not govern third-party services. Please review their policies directly.',
      'We use PostHog as a processor/service provider for analytics and session replay, under contractual restrictions limiting use to services performed on our behalf.'
    ],
  },
  {
    title: '11. Changes to This Policy',
    paragraphs: [
      'We may update this policy from time to time. Material changes will be reflected by updating the effective date and, where appropriate, by in-app or email notice.',
    ],
  },
  {
    title: '12. Session Replay and Product Analytics',
    paragraphs: [
      'We use PostHog for product analytics and, where enabled, session replay to understand app usage, diagnose bugs, and improve user experience.',
      'Session replay may record in-app interactions such as:',
      'Screen navigation and page/screen views',
      'Taps, clicks, scrolling, and gesture interactions',
      'UI state changes and timestamps',
      'Device/app metadata (for example: app version, OS version, device type, locale, timezone)',
    ],
  },
  {
    title: '13. Session Replay and Product Analytics',
    paragraphs: [
      'We do not intentionally use session replay to collect payment card numbers, account passwords, or other highly sensitive credentials. Where feasible, we apply masking and exclusion controls to prevent sensitive fields from being captured.',
      'Analytics and replay data may be processed by our service provider, PostHog, including in the United States (for example, via us.i.posthog.com), subject to contractual and security safeguards.',
      'We use this data only for legitimate business purposes such as: Improving app performance and stability; Debugging errors and fixing defects; Understanding feature adoption and product usage; Prioritizing roadmap improvements',
      'We retain replay and analytics data only as long as needed for these purposes, then delete or anonymize it according to our retention schedule.',
      'You may request access to or deletion of personal data associated with analytics/replay by contacting us at the email listed in this policy.'
    ]
  },
  {
    title: '14. Contact Us',
    paragraphs: [
      'Phoenix Soteria LLC',
      '[Mailing Address - To Be Added]',
      '[Contact Email - To Be Added]',
    ],
  },
];

export default function PrivacySecuritySettings() {
  const posthog = usePostHog();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'privacy_security_modal', section: 'modal' });
    }, [posthog])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SectionHeader title='Privacy & Security' />
        <Text style={styles.effectiveDate}>Effective Date: March 23, 2026</Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {policySections.map((section) => (
            <View key={section.title} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.paragraphs.map((paragraph, index) => (
                <Text key={`${section.title}-${index}`} style={styles.paragraphText}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
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
    effectiveDate: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      color: theme.colors.subtext,
      fontSize: theme.font.small,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
      rowGap: theme.spacing.sm,
    },
    sectionCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.card,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      rowGap: theme.spacing.xs,
    },
    sectionTitle: {
      fontSize: theme.font.body,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    paragraphText: {
      fontSize: theme.font.small,
      lineHeight: 20,
      color: theme.colors.text,
    },
  });