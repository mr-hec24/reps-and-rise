import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/auth-provider';
import { useUser } from '@/context/user-provider';
import { pickImage } from '@/lib/image-upload';
import { useThemeMode } from '@/theme/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';

export default function ProfileScreen() {
  const posthog = usePostHog();
  const { signOut } = useAuth();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  const {
    profile,
    isLoading,
    isUpdating,
    isUploadingAvatar,
    error,
    updateProfile,
    uploadAvatarImage,
    refreshProfile,
  } = useUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'profile_settings_modal', section: 'modal' });
    }, [posthog])
  );

  // Load profile data into form when available
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
  }, [profile]);

  // Check for changes
  useEffect(() => {
    if (profile) {
      const currentFirstName = profile.first_name || '';
      const currentLastName = profile.last_name || '';
      setHasChanges(firstName !== currentFirstName || lastName !== currentLastName);
    }
  }, [firstName, lastName, profile]);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    posthog.capture('button_click', { screen: 'profile_settings_modal', button: 'sign_out' });

    setIsSigningOut(true);
    try {
      await signOut();
      // No need to handle success here - the auth provider will redirect
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      // Even if there's an error, the signOut function should handle it gracefully
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!hasChanges) {
      Alert.alert('No Changes', 'No changes to save.');
      return;
    }

    try {
      posthog.capture('button_click', { screen: 'profile_settings_modal', button: 'save_profile_changes' });
      await updateProfile({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save profile');
    }
  };

  const handleAvatarUpload = async () => {
    if (isUploadingAvatar) return;

    posthog.capture('button_click', { screen: 'profile_settings_modal', button: 'upload_avatar' });

    try {
      const result = await pickImage();

      if (!result || result.canceled || !result.assets || result.assets.length === 0) {
        return; // User cancelled or no image selected
      }

      const imageUri = result.assets[0].uri;
      const uploadResult = await uploadAvatarImage(imageUri);

      if (uploadResult.success) {
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', uploadResult.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload image');
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile?.email || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const CameraIcon = () => <FontAwesome size={16} name='camera' color='white' />;

  const getAvatarSource = () => {
    if (profile?.avatar_url) {
      return { uri: profile.avatar_url };
    }
    return undefined; // This will fallback to initials
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <VStack space='xl' className='h-full w-full justify-center items-center p-6'>
          <Text style={styles.bodyText}>Loading profile...</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <VStack space='xl' className='h-full w-full justify-center items-center p-6'>
          <Text style={styles.errorText}>Error loading profile: {error}</Text>
          <Button onPress={refreshProfile}>
            <ButtonText>Retry</ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <VStack space='xl' className='h-full w-full justify-start p-6 pt-12'>
          <VStack space='md' className='w-full items-center'>
            <Heading size='2xl' style={styles.heading}>Profile</Heading>
            <Text style={styles.bodyTextCenter}>Manage your account information</Text>
          </VStack>

          {/* User Avatar */}
          <VStack space='md' className='w-full items-center'>
            <TouchableOpacity
              onPress={handleAvatarUpload}
              disabled={isUploadingAvatar}
              activeOpacity={0.7}
            >
              <Avatar size='2xl'>
                <AvatarFallbackText>{getInitials()}</AvatarFallbackText>
                {getAvatarSource() && <AvatarImage source={getAvatarSource()} />}
                <AvatarBadge className='bg-primary-500 items-center justify-center'>
                  {isUploadingAvatar ? (
                    <ActivityIndicator size='small' color='white' />
                  ) : (
                    <CameraIcon />
                  )}
                </AvatarBadge>
              </Avatar>
            </TouchableOpacity>
            <Text style={styles.helperText}>
              Tap to {profile?.avatar_url ? 'change' : 'upload'} profile picture
            </Text>
          </VStack>

          {/* Profile Inputs */}
          <VStack space='lg' className='w-full'>
            <FormControl
              size='md'
              isDisabled={isUpdating || isUploadingAvatar}
              isReadOnly={false}
              isRequired={false}
              className='w-full'
            >
              <FormControlLabel>
                <FormControlLabelText style={styles.labelText}>First Name</FormControlLabelText>
              </FormControlLabel>
              <Input className='w-full' size='md' variant='outline'>
                <InputField
                  type='text'
                  placeholder='Enter your first name'
                  placeholderTextColor={theme.colors.placeholder}
                  value={firstName}
                  onChangeText={text => setFirstName(text)}
                  className='w-full'
                  style={{ color: theme.colors.text }}
                />
              </Input>
            </FormControl>

            <FormControl
              size='md'
              isDisabled={isUpdating || isUploadingAvatar}
              isReadOnly={false}
              isRequired={false}
              className='w-full'
            >
              <FormControlLabel>
                <FormControlLabelText style={styles.labelText}>Last Name</FormControlLabelText>
              </FormControlLabel>
              <Input className='w-full' size='md' variant='outline'>
                <InputField
                  type='text'
                  placeholder='Enter your last name'
                  value={lastName}
                  onChangeText={text => setLastName(text)}
                  className='w-full'
                  placeholderTextColor={theme.colors.placeholder}
                  style={{ color: theme.colors.text }}
                />
              </Input>
            </FormControl>

            <FormControl
              size='md'
              isDisabled={true}
              isReadOnly={true}
              isRequired={false}
              className='w-full'
            >
              <FormControlLabel>
                <FormControlLabelText style={styles.labelText}>Email</FormControlLabelText>
              </FormControlLabel>
              <Input className='w-full' size='md' variant='outline'>
                <InputField
                  type='text'
                  placeholder='Email address'
                  value={profile?.email || ''}
                  className='w-full'
                  keyboardType='email-address'
                  autoCapitalize='none'
                  editable={false}
                  placeholderTextColor={theme.colors.placeholder}
                  style={{ color: theme.colors.text }}
                />
              </Input>
            </FormControl>
          </VStack>

          {/* Action Buttons */}
          <VStack space='md' className='w-full mt-auto'>
            <Button
              size='lg'
              variant='solid'
              action='primary'
              className='w-full'
              onPress={handleSaveProfile}
              isDisabled={!hasChanges || isUpdating || isUploadingAvatar}
            >
              <ButtonText>
                {isUpdating ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
              </ButtonText>
            </Button>

            <Button
              size='lg'
              variant='outline'
              action='secondary'
              className='w-full'
              onPress={handleSignOut}
              isDisabled={isSigningOut || isUpdating || isUploadingAvatar}
            >
              <ButtonText>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</ButtonText>
            </Button>
          </VStack>
        </VStack>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    heading: {
      color: theme.colors.text,
    },
    bodyText: {
      color: theme.colors.text,
    },
    bodyTextCenter: {
      color: theme.colors.text,
      textAlign: 'center',
    },
    helperText: {
      color: theme.colors.placeholder,
      textAlign: 'center',
      fontSize: 12,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
    },
    labelText: {
      color: theme.colors.text
    }
  });
