import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { ImageUploadResult, uploadAvatar } from '@/lib/image-upload';
import { supabase } from '@/lib/supabase';
import { UpdateUserProfileData, UserProfile } from '@/lib/types';
import { useAuth } from './auth-provider';

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  isUpdating: boolean;
  isUploadingAvatar: boolean;
  error: string | null;
  updateProfile: (data: UpdateUserProfileData) => Promise<void>;
  uploadAvatarImage: (imageUri: string) => Promise<ImageUploadResult>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserState>({
  profile: null,
  isLoading: false,
  isUpdating: false,
  isUploadingAvatar: false,
  error: null,
  updateProfile: async () => {},
  uploadAvatarImage: async () => ({ success: false, error: 'Not implemented' }),
  refreshProfile: async () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      setError(null);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        // If profile doesn't exist, create one from auth user metadata
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating from auth metadata...');
          return await createProfileFromAuth(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      setError(errorMessage);
      return null;
    }
  };

  const createProfileFromAuth = async (userId: string): Promise<UserProfile | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user found');
      }

      const profileData = {
        id: userId,
        email: user.email!,
        first_name: user.user_metadata?.first_name || null,
        last_name: user.user_metadata?.last_name || null,
      };

      const { data, error } = await supabase.from('profiles').insert(profileData).select().single();

      if (error) {
        throw error;
      }

      console.log('Profile created successfully');
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      setError(errorMessage);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    try {
      const profileData = await fetchProfile(session.user.id);
      setProfile(profileData);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateUserProfileData) => {
    if (!session?.user?.id) {
      throw new Error('No authenticated user');
    }

    if (!profile) {
      throw new Error('No profile data available');
    }

    setIsUpdating(true);
    setError(null);

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(updatedProfile);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const uploadAvatarImage = async (imageUri: string): Promise<ImageUploadResult> => {
    if (!session?.user?.id) {
      return { success: false, error: 'No authenticated user' };
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      // Upload the image to Supabase storage
      const uploadResult = await uploadAvatar(imageUri, session.user.id);

      if (!uploadResult.success) {
        setError(uploadResult.error || 'Failed to upload image');
        return uploadResult;
      }

      // Update the profile with the new avatar URL
      await updateProfile({ avatar_url: uploadResult.imageUrl });

      return uploadResult;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Load profile when session changes
  useEffect(() => {
    if (session?.user?.id) {
      refreshProfile();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [session?.user?.id]);

  return (
    <UserContext.Provider
      value={{
        profile,
        isLoading,
        isUpdating,
        isUploadingAvatar,
        error,
        updateProfile,
        uploadAvatarImage,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
