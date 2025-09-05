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
import { useState } from 'react';
import { SafeAreaView } from 'react-native';

export default function SignUp() {
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (!firstName.trim()) {
      setErrorMessage('First name is required');
      return false;
    }
    if (!lastName.trim()) {
      setErrorMessage('Last name is required');
      return false;
    }
    if (!email.trim()) {
      setErrorMessage('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setErrorMessage('Password is required');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, firstName, lastName);
    } catch (error) {
      console.error('Error signing up:', error);

      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          setErrorMessage(
            'Unable to connect to the authentication service. Please check your internet connection and try again. If the problem persists, the app may need to be configured with valid credentials.'
          );
        } else if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please try again.');
        } else if (error.message.includes('User already registered')) {
          setErrorMessage(
            'An account with this email already exists. Please try signing in instead.'
          );
        } else if (error.message.includes('Password should be at least')) {
          setErrorMessage('Password is too weak. Please choose a stronger password.');
        } else {
          setErrorMessage(error.message || 'An error occurred during sign up. Please try again.');
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex h-full w-full flex-1 bg-background'>
      <VStack space='xl' className='h-full w-full justify-center p-6'>
        <VStack space='md' className='w-full items-center'>
          <Heading size='2xl'>Sign Up</Heading>
          <Text className='text-center'>Create your account</Text>
        </VStack>

        {errorMessage ? (
          <VStack className='w-full'>
            <Text className='text-error-600 text-center text-sm bg-error-50 p-3 rounded-md'>
              {errorMessage}
            </Text>
          </VStack>
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
              <FormControlLabelText>First Name</FormControlLabelText>
            </FormControlLabel>
            <Input className='w-full' size='md' variant='outline'>
              <InputField
                type='text'
                placeholder='Enter your first name'
                value={firstName}
                onChangeText={text => setFirstName(text)}
                className='w-full'
              />
            </Input>
          </FormControl>

          <FormControl
            size='md'
            isDisabled={isLoading}
            isReadOnly={false}
            isRequired={true}
            className='w-full'
          >
            <FormControlLabel>
              <FormControlLabelText>Last Name</FormControlLabelText>
            </FormControlLabel>
            <Input className='w-full' size='md' variant='outline'>
              <InputField
                type='text'
                placeholder='Enter your last name'
                value={lastName}
                onChangeText={text => setLastName(text)}
                className='w-full'
              />
            </Input>
          </FormControl>

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
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </Input>
          </FormControl>

          <FormControl
            size='md'
            isDisabled={isLoading}
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
          </FormControl>

          <FormControl
            size='md'
            isDisabled={isLoading}
            isReadOnly={false}
            isRequired={true}
            className='w-full'
          >
            <FormControlLabel>
              <FormControlLabelText>Confirm Password</FormControlLabelText>
            </FormControlLabel>
            <Input className='w-full' size='md' variant='outline'>
              <InputField
                type='password'
                placeholder='Confirm your password'
                value={confirmPassword}
                onChangeText={text => setConfirmPassword(text)}
                className='w-full'
                secureTextEntry={true}
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>
                Password must be at least 6 characters long.
              </FormControlHelperText>
            </FormControlHelper>
          </FormControl>
        </VStack>

        <VStack space='md' className='w-full'>
          <Button
            size='lg'
            variant='solid'
            action='primary'
            className='w-full'
            onPress={handleSignUp}
            isDisabled={isLoading}
          >
            <ButtonText>{isLoading ? 'Creating Account...' : 'Create Account'}</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
