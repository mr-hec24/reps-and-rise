import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { Button, ButtonText } from '@/components/ui/button';

import { useUser } from '@/context/user-provider';
import { useEffect, useState } from 'react';


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
      <Text style={styles.title}>Home Page</Text>
      <View style={styles.separator} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
      <Button size='md' variant='solid' action='secondary'>
        <ButtonText>Welcome, {firstName} {lastName}</ButtonText>
      </Button>

      <View style={styles.separator} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
      <Button size = 'xl' variant='outline' action='primary'>
        <Link href="/exercise_card" style={styles.link}>Open Modal</Link>
      </Button>

      {/* <Link href="/exercise_card" style={styles.link}>Open Modal</Link> */}

      <Text style={{ marginTop: 20, fontSize: 16, textAlign: 'center' }}>Have a great session today, you're gonna kill it!</Text>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
