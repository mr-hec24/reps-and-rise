import { Screen } from '@/components/Screen';
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import {
  BackButton,
  DangerButton,
  Field,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui-ember';
import { useAuth } from '@/context/auth-provider';
import { useUser } from '@/context/user-provider';
import { pickImage } from '@/lib/image-upload';
import { useThemeMode } from '@/theme/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileSettingsScreen() {
  const posthog = usePostHog();
  const router = useRouter();
  const { signOut, isGuest } = useAuth();
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

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    posthog.capture('button_click', { screen: 'profile_settings_modal', button: 'sign_out' });

    setIsSigningOut(true);
    try {
      await signOut();
      // No need to handle success here - the auth provider will redirect
    } catch (signOutError) {
      console.error('Unexpected error during sign out:', signOutError);
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
      posthog.capture('button_click', {
        screen: 'profile_settings_modal',
        button: 'save_profile_changes',
      });
      await updateProfile({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (saveError) {
      console.error('Error saving profile:', saveError);
      Alert.alert(
        'Error',
        saveError instanceof Error ? saveError.message : 'Failed to save profile'
      );
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
    } catch (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      Alert.alert(
        'Error',
        uploadError instanceof Error ? uploadError.message : 'Failed to upload image'
      );
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile?.email || 'User';
  };

  const getInitials = () =>
    getDisplayName()
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getAvatarSource = () => (profile?.avatar_url ? { uri: profile.avatar_url } : undefined);

  if (isLoading) {
    return (
      <Screen pad={24}>
        <View style={styles.centered}>
          <Text style={styles.status}>Loading profile…</Text>
        </View>
      </Screen>
    );
  }

  if (error && !profile) {
    return (
      <Screen pad={24}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error loading profile: {error}</Text>
          <PrimaryButton label='Retry' onPress={refreshProfile} style={styles.stretch} />
        </View>
      </Screen>
    );
  }

  const saving = isUpdating || isUploadingAvatar;

  return (
    <Screen>
      <View style={styles.header}>
        <BackButton onPress={goBack} />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {isGuest && (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeHeading}>Upgrade your account</Text>
            <Text style={styles.upgradeBody}>
              Register with an email to unlock additional benefits and keep your progress safe
              longer.
            </Text>
            {[
              'Data is saved more reliably and restored across devices.',
              'Your app progress is preserved longer term.',
              'You can recover your account if you sign out or reinstall.',
              'You get a consistent identity for future features.',
            ].map(line => (
              <Text key={line} style={styles.upgradeBullet}>
                • {line}
              </Text>
            ))}
            <SecondaryButton
              label='Register your account'
              onPress={() => router.push('/sign-up?upgrade=true')}
              style={styles.upgradeAction}
            />
          </View>
        )}

        <View style={styles.avatarBlock}>
          <TouchableOpacity
            onPress={handleAvatarUpload}
            disabled={isUploadingAvatar}
            activeOpacity={0.7}
            accessibilityRole='button'
            accessibilityLabel='Change profile picture'
          >
            <Avatar size='2xl'>
              <AvatarFallbackText>{getInitials()}</AvatarFallbackText>
              {getAvatarSource() && <AvatarImage source={getAvatarSource()} />}
              <AvatarBadge className='items-center justify-center' style={styles.avatarBadge}>
                {isUploadingAvatar ? (
                  <ActivityIndicator size='small' color={theme.colors.onAccent} />
                ) : (
                  <FontAwesome size={14} name='camera' color={theme.colors.onAccent} />
                )}
              </AvatarBadge>
            </Avatar>
          </TouchableOpacity>
          <Text style={styles.helperText}>
            Tap to {profile?.avatar_url ? 'change' : 'upload'} profile picture
          </Text>
        </View>

        <View style={styles.fields}>
          <View style={styles.nameRow}>
            <View style={styles.nameCell}>
              <Field
                label='First name'
                placeholder='Alex'
                value={firstName}
                onChangeText={setFirstName}
                editable={!saving}
              />
            </View>
            <View style={styles.nameCell}>
              <Field
                label='Last name'
                placeholder='Rivera'
                value={lastName}
                onChangeText={setLastName}
                editable={!saving}
              />
            </View>
          </View>

          <Field
            label='Email'
            value={profile?.email || ''}
            readOnly
            keyboardType='email-address'
            autoCapitalize='none'
            hint='Email is read-only — it identifies your account.'
          />
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={isUpdating ? 'Saving…' : hasChanges ? 'Save changes' : 'No changes'}
            onPress={handleSaveProfile}
            disabled={!hasChanges || saving}
          />
          <DangerButton
            label={isSigningOut ? 'Signing out…' : 'Sign out'}
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 12,
    },
    headerTitle: {
      flex: 1,
      fontFamily: theme.font.family.display,
      fontSize: 18,
      letterSpacing: -0.36,
      color: theme.colors.text,
    },
    headerSpacer: { width: 38 },
    content: { paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    stretch: { alignSelf: 'stretch' },
    status: {
      fontFamily: theme.font.family.body,
      fontSize: 14,
      color: theme.colors.subtext,
    },
    errorText: {
      fontFamily: theme.font.family.body,
      fontSize: 14,
      color: theme.colors.danger,
      textAlign: 'center',
    },
    upgradeCard: {
      padding: 16,
      borderRadius: 17,
      backgroundColor: theme.colors.accentSoft,
      borderWidth: 1,
      borderColor: theme.colors.accentSoftBorder,
      gap: 8,
    },
    upgradeHeading: {
      fontFamily: theme.font.family.display,
      fontSize: 17,
      color: theme.colors.text,
    },
    upgradeBody: {
      fontFamily: theme.font.family.body,
      fontSize: 13.5,
      lineHeight: 20,
      color: theme.colors.subtext,
    },
    upgradeBullet: {
      fontFamily: theme.font.family.body,
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.subtext,
    },
    upgradeAction: { marginTop: 8 },
    avatarBlock: { alignItems: 'center', gap: 12 },
    avatarBadge: { backgroundColor: theme.colors.accent, borderColor: theme.colors.background },
    helperText: {
      fontFamily: theme.font.family.body,
      fontSize: 12,
      color: theme.colors.muted,
      textAlign: 'center',
    },
    fields: { gap: 14 },
    nameRow: { flexDirection: 'row', gap: 12 },
    nameCell: { flex: 1 },
    actions: { gap: 11 },
  });
