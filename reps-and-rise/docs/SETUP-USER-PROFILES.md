# User Profile Setup Guide

## Overview

This implementation adds user profile management to your Expo app with Supabase.
Users can now edit their first name and last name from the ProfileScreen, with
data automatically synced to Supabase.

## Architecture

- **Separation of Concerns**: `AuthProvider` handles authentication,
  `UserProvider` handles user profile data
- **Type Safety**: Full TypeScript support with proper interfaces
- **Auto-sync**: Profile data automatically loads when user signs in
- **Optimistic Updates**: UI updates immediately while syncing to backend

## Database Setup

### 1. Run the SQL Migration

Execute the SQL commands in `lib/database-schema.sql` in your Supabase SQL
editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `lib/database-schema.sql`
4. Execute the query

### 2. What the Migration Creates

- **`profiles` table**: Stores user profile data with automatic timestamps
- **RLS Policies**: Ensures users can only access their own profile
- **Triggers**: Automatically updates `updated_at` on profile changes
- **Auto-profile creation**: Creates profile when new user signs up

## Features

### ✅ Implemented

- **Profile Data Management**: Create, read, update profile data
- **Real-time UI Updates**: Form fields populate with current data
- **Change Detection**: Save button only enabled when changes exist
- **Loading States**: Proper loading indicators during operations
- **Error Handling**: User-friendly error messages
- **Type Safety**: Full TypeScript support
- **Auto-sync**: Profile automatically created from auth metadata

### 🔄 Available for Extension

- **Avatar Upload**: Extend to handle profile image uploads
- **Additional Fields**: Add phone, bio, preferences, etc.
- **Profile Validation**: Add custom validation rules
- **Profile Settings**: Extend for notification preferences, etc.

## Usage

### In Components

```tsx
import { useUser } from '@/context/user-provider';

function MyComponent() {
  const { profile, isLoading, updateProfile } = useUser();

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Welcome, {profile?.first_name}!</Text>
      <Button onPress={() => updateProfile({ first_name: 'New Name' })}>
        Update Name
      </Button>
    </View>
  );
}
```

### Profile Operations

```tsx
// Update profile
await updateProfile({
  first_name: 'John',
  last_name: 'Doe',
});

// Refresh profile data
await refreshProfile();

// Access profile data
const displayName = profile?.first_name || profile?.email;
```

## Error Handling

The system handles various error scenarios:

- **Network issues**: Graceful fallbacks with user-friendly messages
- **Profile not found**: Automatically creates profile from auth data
- **Permission errors**: Clear messaging about access issues
- **Validation errors**: Helpful feedback for invalid data

## Security

- **Row Level Security**: Users can only access their own profile
- **Type Safety**: Prevents invalid data from reaching the database
- **Input Sanitization**: Trim whitespace and handle null values
- **Email Validation**: Database-level email format validation

## Performance

- **Optimized Loading**: Profile loads once per session
- **Minimal Re-renders**: Efficient state management
- **Automatic Cleanup**: Proper cleanup on unmount
- **Error Recovery**: Graceful handling of temporary failures

## Testing

Test the implementation:

1. **Sign up a new user** - Profile should be created automatically
2. **Edit profile** - Changes should save and persist
3. **Sign out/in** - Profile data should load correctly
4. **Network offline** - Should handle gracefully

## Troubleshooting

### Profile Not Loading

- Check Supabase RLS policies are applied
- Verify database migration ran successfully
- Check browser console for errors

### Updates Not Saving

- Verify user is authenticated
- Check RLS policies allow updates
- Ensure proper error handling in UI

### TypeScript Errors

- Verify all interfaces are properly imported
- Check that null/undefined values are handled correctly

## Future Enhancements

This foundation supports easy extension:

- **File Uploads**: Add avatar/document upload capabilities
- **Additional Fields**: Extend profile with more user data
- **Preferences**: Add user settings and preferences
- **Social Features**: Add social profile features
- **Analytics**: Track profile completion and usage
