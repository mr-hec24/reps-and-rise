import { decode } from 'base64-arraybuffer';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

// Image upload configuration
const AVATAR_BUCKET = 'avatars';
const MAX_IMAGE_SIZE = 1024; // Max width/height in pixels
const IMAGE_QUALITY = 0.8; // Compression quality (0-1)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Request permission to access the image library
 */
export const requestImagePermissions = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting image permissions:', error);
    return false;
  }
};

/**
 * Pick an image from the device gallery
 */
export const pickImage = async (): Promise<ImagePicker.ImagePickerResult | null> => {
  try {
    // Check permissions
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      throw new Error('Permission to access camera roll is required');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: IMAGE_QUALITY,
      exif: false, // Don't include EXIF data for privacy
    });

    return result;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

/**
 * Optimize image for upload (resize and compress)
 */
export const optimizeImage = async (uri: string): Promise<string | null> => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [
        // Resize if larger than max size
        { resize: { width: MAX_IMAGE_SIZE, height: MAX_IMAGE_SIZE } },
      ],
      {
        compress: IMAGE_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      }
    );

    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error optimizing image:', error);
    return null;
  }
};

/**
 * Convert image URI to base64 for upload
 */
export const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data:image/jpeg;base64, prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

/**
 * Generate a unique filename for the avatar
 */
export const generateAvatarFilename = (userId: string): string => {
  const timestamp = Date.now();
  return `${userId}/avatar-${timestamp}.jpg`;
};

/**
 * Upload avatar image to Supabase storage
 */
export const uploadAvatar = async (
  imageUri: string,
  userId: string
): Promise<ImageUploadResult> => {
  try {
    // Optimize the image first
    const optimizedUri = await optimizeImage(imageUri);
    if (!optimizedUri) {
      return { success: false, error: 'Failed to optimize image' };
    }

    // Convert to base64
    const base64 = await convertImageToBase64(optimizedUri);
    if (!base64) {
      return { success: false, error: 'Failed to process image' };
    }

    // Check file size
    const arrayBuffer = decode(base64);
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `Image too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Delete existing avatar if it exists
    await deleteExistingAvatar(userId);

    // Generate unique filename
    const filename = generateAvatarFilename(userId);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filename, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false, // Don't overwrite, use unique filenames
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: `Upload failed: ${error.message}` };
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filename);

    return { success: true, imageUrl: publicUrl };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return { success: false, error: errorMessage };
  }
};

/**
 * Delete existing avatar from storage
 */
export const deleteExistingAvatar = async (userId: string): Promise<void> => {
  try {
    // List files in the user's folder
    const { data: files, error } = await supabase.storage.from(AVATAR_BUCKET).list(userId);

    if (error || !files || files.length === 0) {
      return; // No existing files or error listing
    }

    // Delete all existing avatar files for this user
    const filePaths = files.map(file => `${userId}/${file.name}`);
    const { error: deleteError } = await supabase.storage.from(AVATAR_BUCKET).remove(filePaths);

    if (deleteError) {
      console.warn('Warning: Failed to delete existing avatar:', deleteError);
      // Don't throw error, as this is just cleanup
    }
  } catch (error) {
    console.warn('Warning: Error deleting existing avatar:', error);
    // Don't throw error, as this is just cleanup
  }
};

/**
 * Delete avatar by URL
 */
export const deleteAvatarByUrl = async (avatarUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === AVATAR_BUCKET);

    if (bucketIndex === -1 || bucketIndex >= pathParts.length - 1) {
      console.warn('Could not extract file path from avatar URL');
      return;
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([filePath]);

    if (error) {
      console.warn('Warning: Failed to delete avatar by URL:', error);
    }
  } catch (error) {
    console.warn('Warning: Error deleting avatar by URL:', error);
  }
};
