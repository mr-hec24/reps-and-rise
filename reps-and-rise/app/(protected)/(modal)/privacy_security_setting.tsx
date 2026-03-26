import { SectionHeader } from '@/components/SectionHeader';
import { useThemeMode } from '@/theme/ThemeContext';
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
      'We do not sell, rent, or trade your personal information. We share data only with trusted providers needed to run the App, including Stripe for payment processing, cloud infrastructure providers (AWS/GCP/Azure), and Google Analytics for product usage insights.',
      'We may also disclose information when legally required or when necessary to protect the rights, safety, or property of Phoenix Soteria LLC, our users, or the public.',
    ],
  },
  {
    title: '6. Data Retention',
    paragraphs: [
      'We retain personal information while your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal data within 30 days, except where legal retention requirements apply.',
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
      'The App may include links to or integrations with third-party services (for example, Google or Apple sign-in). This policy does not govern third-party services. Please review their policies directly.',
    ],
  },
  {
    title: '11. Changes to This Policy',
    paragraphs: [
      'We may update this policy from time to time. Material changes will be reflected by updating the effective date and, where appropriate, by in-app or email notice.',
    ],
  },
  {
    title: '12. Contact Us',
    paragraphs: [
      'Phoenix Soteria LLC',
      '[Mailing Address - To Be Added]',
      '[Contact Email - To Be Added]',
    ],
  },
];

export default function PrivacySecuritySettings() {
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

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