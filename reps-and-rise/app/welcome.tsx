import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native';

export default function Welcome() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <SafeAreaView className='flex h-full flex-1 bg-background'>
      <VStack space='2xl' className='h-full items-center justify-center p-4'>
        <Heading>Welcome to Reps & Rise</Heading>
        <Text>
          Reps & Rise is a fitness app designed to help you track your workouts and stay motivated.
        </Text>
        <VStack space='md'>
          <Button size='md' variant='solid' action='primary' onPress={handleSignIn}>
            <ButtonText>Sign In</ButtonText>
          </Button>
          <Button size='md' variant='solid' action='primary' onPress={handleSignUp}>
            <ButtonText>Sign Up</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
