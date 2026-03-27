import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';

import { useUser } from '@/context/user-provider';
import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { useThemeMode } from '@/theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SectionHeader } from '@/components/SectionHeader';
import { Row } from '@/components/Row';
import { formatDate } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';

export default function TabOneScreen() {
  const posthog = usePostHog();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);

  const {
    profile
  } = useUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Load profile data into form when available
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'home_tab', section: 'tab' });
    }, [posthog])
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* <SectionHeader title={`Today is ${new Date().toLocaleDateString()}`} /> */}
        <SectionHeader title={`Today is ${formatDate(new Date())}`} />
      <Text style={styles.subtitle}>Ready to crush your workout?</Text>

      <TouchableOpacity onPress={() => {
        posthog.capture('button_click', { screen: 'home_tab', button: 'start_exercise' });
        posthog.capture('workout_session_started', { source: 'home_tab' });
        router.push({pathname: '/exercise-input'});
      }}>
        <LinearGradient colors={[theme.colors.secondary, theme.colors.primary]} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.startButton}>
          <Image 
            style={styles.image}
            source={require('@/assets/images/dumbbell-solid.png')}
            contentFit="cover"
            transition={1000}
          />
          <Text style={styles.startText}>Start Exercise</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* <View style={styles.separator} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' /> */}
      
      <Row style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>82%</Text>
          <Text style={styles.statLabel}>Goal</Text>
        </Card>
      </Row>

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
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: theme.font.subtitle,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.xl,

  },
  title: {
    fontSize: theme.font.title,
    fontWeight: "700",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  startText: {
    color: '#fff',
    fontSize: theme.font.subtitle,
    fontWeight: 600,
  },
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
  },
  statValue: {
    fontSize: theme.font.subtitle,
    fontWeight: 700,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.font.small,
    color: theme.colors.subtext,
    marginTop: theme.spacing.xs,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    transform: [{ rotate: '140deg' }],
    tintColor: "#fff",
  }
});
