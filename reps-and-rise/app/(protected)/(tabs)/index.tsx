import { StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';

import { useUser } from '@/context/user-provider';
import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { theme } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SectionHeader } from '@/components/SectionHeader';

export default function TabOneScreen() {

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


  return (
    <View style={styles.container}>
      <SectionHeader title={`Today is ${new Date().toLocaleDateString()}`} />
      <Text style={styles.subtitle}>Ready to crush your workout?</Text>

      <TouchableOpacity onPress={() => router.push({pathname: '/exercise_card'})}>
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
      
      <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
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
      </View>

    </View>
  );
}



const styles = StyleSheet.create({
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
