import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeMode } from '@/theme/ThemeContext';

export default function TabOneScreen() {
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <SectionHeader title='Your Metrics' />
      
      <View style={styles.overlayBanner}>
        <Text style={styles.overlayBannerTitle}>Coming Soon</Text>
        <Text style={styles.overlayBannerText}>Full metrics dashboard is in progress; stay tuned for analytics and history.</Text>
      </View>

      <LinearGradient colors={[theme.colors.secondary, theme.colors.primary]} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.bigCard}>
            <Text style={styles.bigNumber}>+10%</Text>
            <Text style={styles.subtitle}>Strength</Text>
            <Text style={styles.description}>Amazing progress this month. Keep pushing forward</Text>
        </LinearGradient>
        

      <Card style={styles.tinyCard}>
        <Text style={styles.subtext}>Strength</Text>
        <Text style={styles.value}>+10%</Text>
        <Text style={styles.subtext}>Compared to last month</Text>  
      </Card>

      <Card style={styles.tinyCard}>
        <Text style={styles.subtext}>Workout Streak</Text>
        <Text style={styles.value}>5 Days</Text>
        <Text style={styles.subtext}>Keep it up!</Text>  
      </Card>

      <Card style={styles.tinyCard}>
        <Text style={styles.subtext}>Weekly Goal</Text>
        <Text style={styles.value}>82%</Text>
        <Text style={styles.subtext}>Great progress!</Text>  
      </Card>

    </View>
  </SafeAreaView>
  );
}



const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: theme.colors.border,
  },
  bigCard: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.md
  },
  subtitle: {
    fontSize: theme.font.subtitle,
    marginTop: theme.spacing.sm,
    color: theme.colors.background,
  },
    description: {
      color: theme.colors.border,
      marginTop: theme.spacing.sm,
    },
    label: {
        fontSize: theme.font.subtitle,
        fontWeight: 600,
    },
    value: {
        fontSize: theme.font.subtitle,
        fontWeight: 700,
        marginTop: theme.spacing.xs,
    },
    subtext: {
        color: theme.colors.subtext,
        marginTop: theme.spacing.xs,
    },
  overlayBanner: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBannerTitle: {
    fontSize: theme.font.title,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  overlayBannerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: theme.font.body,
    maxWidth: '80%',
  },
  comingSoonTitle: {
    fontSize: theme.font.subtitle,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    color: theme.colors.primary,
  },
  comingSoonText: {
    color: theme.colors.text,
    fontSize: theme.font.body,
  },
  tinyCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  
});
