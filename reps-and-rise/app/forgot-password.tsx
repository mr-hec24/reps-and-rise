import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, SafeAreaView, TouchableWithoutFeedback } from 'react-native';

export default function ForgotPassword() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    setErrorMessage('');
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset instructions have been sent to your email.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex h-full w-full flex-1 bg-background'>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <VStack space='xl' className='h-full w-full justify-center p-6'>
          <VStack space='md' className='w-full items-center'>
            <Heading size='2xl'>Reset Password</Heading>
            <Text className='text-center'>Enter your email to receive reset instructions.</Text>
          </VStack>

          {message ? (
            <Text className='text-success-700 text-center text-sm bg-success-50 p-3 rounded-md'>
              {message}
            </Text>
          ) : null}

          {errorMessage ? (
            <Text className='text-error-600 text-center text-sm bg-error-50 p-3 rounded-md'>
              {errorMessage}
            </Text>
          ) : null}

          <VStack space='lg' className='w-full'>
            <FormControl
              size='md'
              isDisabled={isLoading}
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
                  keyboardType='email-address'
                />
              </Input>
            </FormControl>
          </VStack>

          <VStack space='md' className='w-full'>
            <Button
              size='lg'
              variant='solid'
              action='primary'
              className='w-full'
              onPress={handleResetPassword}
              isDisabled={isLoading}
            >
              <ButtonText>{isLoading ? 'Sending...' : 'Send Reset Link'}</ButtonText>
            </Button>
            <Button
              size='md'
              variant='outline'
              action='secondary'
              className='w-full'
              onPress={() => router.push('/sign-in')}
            >
              <ButtonText>Already have an account?</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
