# Avatar Upload Feature

This guide explains how the avatar upload feature works and how to set it up
properly.

## Features

- **Profile Picture Upload**: Users can upload profile pictures from their
  device
- **Cross-Platform Support**: Works on iOS, Android, and Web
- **Image Optimization**: Automatically resizes and compresses images
- **Secure Storage**: Images are stored in Supabase Storage with proper access
  controls
- **Smart Replacement**: Replaces existing avatars instead of creating
  duplicates
- **Privacy-First**: Removes EXIF data from uploaded images

## Prerequisites

1. **Supabase Project**: You need a Supabase project with Storage enabled
2. **Environment Variables**: Ensure your `.env.local` has the correct Supabase
   credentials
3. **Permissions**: The app will request photo library permissions

## Setup Instructions

### 1. Database Setup

Run the SQL from `scripts/database-schema.sql` in your Supabase SQL editor to:

- Create the `profiles` table with `avatar_url` field
- Set up Row Level Security policies
- Create the `avatars` storage bucket
- Configure storage policies

Alternatively, run just the storage setup from
`scripts/setup-avatar-storage.sql`.

### 2. Verify Storage Bucket

In your Supabase dashboard:

1. Go to Storage
2. Verify the `avatars` bucket exists and is public
3. Check that the policies are properly configured

### 3. Test the Feature

1. Start the development server: `npm start`
2. Navigate to the Profile screen
3. Tap on the avatar to upload a new image
4. Select an image from your device
5. Verify the image uploads and displays correctly

## Technical Implementation

### Image Upload Flow

1. **Permission Check**: Request access to photo library
2. **Image Selection**: Use Expo ImagePicker to select image
3. **Image Optimization**: Resize to 1024x1024px and compress
4. **File Cleanup**: Delete existing avatar files for the user
5. **Upload**: Store optimized image in Supabase Storage
6. **Database Update**: Update user profile with new avatar URL

### Security Features

- **User Isolation**: Users can only upload/delete their own avatars
- **File Size Limits**: Maximum 5MB file size
- **Image Optimization**: Automatic compression and resizing
- **EXIF Removal**: Privacy protection by removing metadata
- **Access Control**: Storage policies prevent unauthorized access

### File Structure

```
lib/
  image-upload.ts     # Core image upload utilities
  types.ts           # TypeScript interfaces
context/
  user-provider.tsx  # User context with avatar upload
app/(protected)/(tabs)/
  profile.tsx        # Profile screen with avatar functionality
```

## Configuration

### Image Upload Settings (lib/image-upload.ts)

```typescript
const MAX_IMAGE_SIZE = 1024; // Max width/height in pixels
const IMAGE_QUALITY = 0.8; // Compression quality (0-1)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
```

### Storage Bucket Structure

```
avatars/
  {user-id}/
    avatar-{timestamp}.jpg
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure photo library permissions are granted
2. **Upload Fails**: Check Supabase storage policies and bucket configuration
3. **Large File Error**: Images over 5MB will be rejected
4. **Missing Avatar**: Verify the storage bucket is public and accessible

### Error Messages

- `Permission to access camera roll is required`: Grant photo library access
- `Image too large. Maximum size is 5MB`: Choose a smaller image
- `Upload failed: [error]`: Check Supabase connection and storage setup
- `Failed to optimize image`: The image format may not be supported

### Debug Steps

1. Check browser/device console for detailed error messages
2. Verify Supabase storage bucket exists and is public
3. Test storage policies by trying to upload manually
4. Ensure the user is properly authenticated

## Dependencies

The feature uses these packages:

- `expo-image-picker`: For image selection
- `expo-image-manipulator`: For image optimization
- `base64-arraybuffer`: For file conversion
- `@supabase/supabase-js`: For storage operations

## Future Enhancements

Potential improvements for the avatar upload feature:

- **Camera Option**: Add ability to take photos directly
- **Crop Tool**: Advanced image cropping interface
- **Multiple Formats**: Support for different image formats
- **Image Filters**: Basic image editing capabilities
- **Bulk Upload**: Multiple image selection
- **Progress Indicators**: Upload progress feedback
