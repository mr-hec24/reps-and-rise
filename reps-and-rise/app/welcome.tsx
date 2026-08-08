import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native';

export default function Welcome() {
  const router = useRouter();
  const { signInAsGuest } = useAuth();

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  const handleGuestSignIn = async () => {
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Guest sign in failed:', error);
    }
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
          <Button size='md' variant='outline' action='secondary' onPress={handleGuestSignIn}>
            <ButtonText>Use App as Guest</ButtonText>
          </Button>
        </VStack>
        <Text className='text-center text-sm text-subtext'>
          Continue as a guest to try the app without creating an account.
        </Text>
      </VStack>
    </SafeAreaView>
  );
}
