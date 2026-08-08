import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Keyboard, SafeAreaView, TouchableWithoutFeedback } from 'react-native';

export default function SignIn() {
  const router = useRouter();
  const { signIn, signInAsGuest } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Error signing in as guest:', error);
    }
  };

  useEffect(() => {
    const checkSignupFlag = async () => {
      try {
        const flag = await AsyncStorage.getItem('signupShowVerify');
        if (flag) {
          setSuccessMessage('Confirm your email to be able to login!');
          await AsyncStorage.removeItem('signupShowVerify');
        }
      } catch (e) {
        console.warn('Error reading signup flag', e);
      }
    };
    checkSignupFlag();
  }, []);

  return (
    <SafeAreaView className='flex h-full w-full flex-1 bg-background'>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <VStack space='xl' className='h-full w-full justify-center p-6'>
        <VStack space='md' className='w-full items-center'>
          <Heading size='2xl'>Sign In</Heading>
          <Text className='text-center'>Sign in to your account</Text>
        </VStack>

          {successMessage ? (
            <VStack className='w-full'>
              <Text className='text-success-700 text-center text-sm bg-success-50 p-3 rounded-md'>
                {successMessage}
              </Text>
            </VStack>
          ) : null}

        <VStack space='lg' className='w-full'>
          <FormControl
            size='md'
            isDisabled={false}
            isReadOnly={false}
            isRequired={true}
            className='w-full'
          >
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Input className='w-full' size='md' variant='outline'>
              <InputField
                type='text'
                placeholder='Enter your email'
                value={email}
                onChangeText={text => setEmail(text)}
                className='w-full'
                autoCapitalize='none'
              />
            </Input>
          </FormControl>

          <FormControl
            size='md'
            isDisabled={false}
            isReadOnly={false}
            isRequired={true}
            className='w-full'
          >
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Input className='w-full' size='md' variant='outline'>
              <InputField
                type='password'
                placeholder='Enter your password'
                value={password}
                onChangeText={text => setPassword(text)}
                className='w-full'
                secureTextEntry={true}
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>Must be at least 6 characters.</FormControlHelperText>
            </FormControlHelper>
          </FormControl>
        </VStack>

        <VStack space='md' className='w-full'>
          <Button
            size='lg'
            variant='solid'
            action='primary'
            className='w-full'
            onPress={handleSignIn}
          >
            <ButtonText>Sign In</ButtonText>
          </Button>
          <Button
            size='lg'
            variant='outline'
            action='secondary'
            className='w-full'
            onPress={() => router.push('/forgot-password')}
          >
            <ButtonText>Forgot Password?</ButtonText>
          </Button>
          <Button
            size='lg'
            variant='outline'
            action='secondary'
            className='w-full'
            onPress={handleGuestSignIn}
          >
            <ButtonText>Continue as Guest</ButtonText>
          </Button>
        </VStack>
      </VStack>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
