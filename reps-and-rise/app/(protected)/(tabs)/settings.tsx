import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { useAuth } from '@/context/auth-provider';
import { useUser } from '@/context/user-provider';
import { pickImage } from '@/lib/image-upload';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@/theme';
import { SectionHeader } from '@/components/SectionHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';


export default function ProfileScreen() {
  const { signOut } = useAuth();
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

  const [selectedSetting, setSelectedSetting] = useState('none');


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


  const getAvatarSource = () => {
    if (profile?.avatar_url) {
      return { uri: profile.avatar_url };
    }
    return undefined; // This will fallback to initials
  };

  if (isLoading) {
    return (
      <SafeAreaView className='flex h-full w-full flex-1 bg-background'>
        <VStack space='xl' className='h-full w-full justify-center items-center p-6'>
          <Text>Loading profile...</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView className='flex h-full w-full flex-1 bg-background'>
        <VStack space='xl' className='h-full w-full justify-center items-center p-6'>
          <Text className='text-center text-red-500'>Error loading profile: {error}</Text>
          <Button onPress={refreshProfile}>
            <ButtonText>Retry</ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  const settings = {
    account: [
      "Profile Settings",
      "Notifications",
      "Privacy & Security",
      "Appearance",
    ],
    support: ["Send Feedback"],
  }

  const openSelectedSetting = (setting) => {
    setSelectedSetting(setting); 
    switch (setting) {
      case "Profile Settings":
        router.push("/profile_settings");
        break;
      case "Notifications":
        router.push('/notification_settings')
        break;  
      case "Privacy & Security":
        router.push('/privacy_security_setting');
        break;    
      case "Appearance":
        // Navigate to appearance settings screen
        break;
      case "Send Feedback": 
        router.push('/send_feedback');
        break;
      default:
        break;
     }
  }

  return (
    <View style={styles.container}>
      <SectionHeader title="Settings" />
      <LinearGradient colors={[theme.colors.secondary, theme.colors.primary]} start={{x:0, y:0}} end={{x:1, y:1}}style={styles.profileCard}><Avatar size='2xl'>
        <AvatarFallbackText>{getInitials()}</AvatarFallbackText>
          {getAvatarSource() && <AvatarImage source={getAvatarSource()} />}  
        </Avatar>
        <View>
          <Text style={styles.profileTitle}>Hello, {getDisplayName()}!</Text>
          <Text style={styles.profileSubtitle}>Member since 2024</Text>
        </View>
      </LinearGradient>
        
      <SectionHeader title="Account" />
      {settings.account.map((setting) => (
        <TouchableOpacity key={setting} style={styles.row} onPress={() => openSelectedSetting(setting)}>
          <Text style={styles.rowText}>{setting}</Text>
        </TouchableOpacity>
      ))}

      <SectionHeader title="Support" />
      {settings.support.map((setting) => (
        <TouchableOpacity key={setting} style={styles.row} onPress={() => openSelectedSetting(setting)}>
          <Text style={styles.rowText}>{setting}</Text>
        </TouchableOpacity>
      ))}
    </View> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: theme.font.title,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
  },
  profileCard: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg
  },
  profileTitle: {
    fontSize: theme.font.subtitle,
    fontWeight: "700",
    color: theme.colors.background,
  },
  profileSubtitle: {
    color: theme.colors.background,
  },
  row: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  rowText: {
    fontSize: theme.font.body,
  }

});
