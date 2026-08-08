# Guest Authentication Setup

## Overview

Reps & Rise now supports **Anonymous Authentication** via Supabase, allowing users to try the app without creating an account. This is the proper way to handle guest access.

## How It Works

### Supabase Anonymous Authentication

Supabase provides a built-in `signInAnonymously()` method that:

1. **Creates a real session** - Just like a regular authenticated user
2. **Assigns a unique user ID** - So you can store guest workouts in the database
3. **No email/password required** - Purely credential-free access
4. **Upgradeable to full account** - Guest can later create an account with email/password
5. **Temporary or permanent** - Guest sessions persist until the user signs out

### Key Differences from Email/Password Auth

| Feature | Anonymous | Email/Password |
|---------|-----------|-----------------|
| Email required | ❌ No | ✅ Yes |
| Password required | ❌ No | ✅ Yes |
| User ID assigned | ✅ Yes | ✅ Yes |
| Can store data | ✅ Yes | ✅ Yes |
| Upgradeable | ✅ Yes | N/A |
| Permanent by default | ❌ No | ✅ Yes |

## Implementation Details

### Auth Flow

```
User Starts App
    ↓
Welcome Screen
    ├─→ Sign In (email/password)
    ├─→ Sign Up (create account)
    └─→ Use App as Guest (anonymous)
            ↓
        signInAsGuest() called
            ↓
        supabase.auth.signInAnonymously()
            ↓
        Session created (no email)
            ↓
        isGuest = !session.user.email
            ↓
        User enters protected area
```

### Detecting Guest Users

The app detects guest/anonymous users by checking if the session's user has an email:

```typescript
// In auth-provider.tsx
const isGuest = !session?.user?.email;
```

This works because:
- **Anonymous users**: No email address in their profile
- **Authenticated users**: Always have an email address

### Guest User Data

Guest users can:
- ✅ Log workouts (stored with their user_id)
- ✅ View their workout history during their session
- ✅ Add activities and track metrics
- ❌ Lose data if they sign out (no email to recover account)
- ❌ Access data on another device (tied to one device/session)

## Usage

### For Users

1. Open the app
2. On the Welcome screen, tap **"Use App as Guest"**
3. Or on the Sign In screen, tap **"Continue as Guest"**
4. Try the app features
5. If they like it, they can create an account later with **"Sign Up"**

### For Developers

Check if the current user is a guest:

```typescript
import { useAuth } from '@/context/auth-provider';

function MyComponent() {
  const { isGuest, session } = useAuth();
  
  if (isGuest) {
    // Show guest-specific UI
    return <Text>You're using the app as a guest</Text>;
  }
  
  return <Text>Authenticated user: {session?.user?.email}</Text>;
}
```

## Database Considerations

### RLS Policies

Your Supabase RLS policies should handle both authenticated and anonymous users:

```sql
-- Allow users to read/write their own data
CREATE POLICY "Users can manage their own data"
ON workout_history
FOR ALL
USING (auth.uid() = user_xid)
WITH CHECK (auth.uid() = user_xid);

-- This works for both authenticated and anonymous users
-- Both have a valid auth.uid()
```

### Data Persistence

When a guest user logs out:
- ❌ Their guest session is destroyed
- ❌ Their data still exists in Supabase but is inaccessible (orphaned)
- ✅ If they create an account with the same `user_id`, they can recover it (advanced)

**Recommendation**: Consider adding a migration feature where guests can upgrade to an account and link their previous data.

## Transitioning Guest to Authenticated

In the future, you could allow guests to upgrade to a full account:

```typescript
const convertGuestToAuthenticated = async (email: string, password: string) => {
  // Link the anonymous session to an email/password account
  const { data, error } = await supabase.auth.updateUser({
    email,
    password
  });
  
  if (error) throw error;
  
  // User's existing guest data now belongs to the authenticated account
  setIsGuest(false);
};
```

This requires storing the current user_id before creating the new account, but Supabase supports account linking.

## Security Notes

### What Supabase Handles

✅ Session management (tokens, expiry)
✅ User isolation (RLS policies)
✅ Secure credential storage
✅ Rate limiting (prevents abuse)

### What Your App Should Handle

✅ Clear messaging that guest data isn't recoverable
✅ Optional data export/backup for guests
✅ Prompt to create account before critical actions
✅ Warning when session is about to expire

## Testing

### Manual Testing

1. **Guest sign in**: Tap "Use App as Guest" on welcome screen
2. **Add workout**: Create a workout entry
3. **Verify persistence**: Navigate away and back, data should remain
4. **Sign out**: Guest data should be unavailable after sign out
5. **New guest session**: Sign in as guest again, should be a different user

### Automated Testing

```typescript
test('Guest can sign in anonymously', async () => {
  const { signInAsGuest } = useAuth();
  
  await signInAsGuest();
  
  expect(isGuest).toBe(true);
  expect(session?.user?.email).toBeFalsy();
  expect(session?.user?.id).toBeTruthy();
});
```

## Troubleshooting

### "Anonymous sign in not supported" error

**Cause**: Anonymous authentication not enabled in Supabase dashboard

**Solution**: 
1. Go to Supabase dashboard → Authentication → Providers
2. Enable "Anonymous Sign-Ins"

### Guest data not persisting

**Cause**: RLS policies blocking anonymous users

**Solution**: Check your RLS policies include `auth.uid()` checks (not email-based)

### Session expires quickly

**Cause**: Supabase anonymous session settings

**Solution**: Anonymous sessions typically last 1 hour by default. Configure in Supabase settings if needed.

## FAQ

**Q: Can guests see other guests' data?**
A: No, RLS policies isolate each user (including guests) to their own data.

**Q: Can I delete guest accounts?**
A: Yes, but their workouts will become orphaned. Consider archiving instead.

**Q: Do guests get emails?**
A: No, they're never contacted. Their session is browser-only.

**Q: Can guests use multiple devices?**
A: No, each session is device-specific. Signing in on another device creates a new guest account.

**Q: How long do guest sessions last?**
A: By default, Supabase anonymous sessions last 1 hour. Check your project settings to adjust.

## Best Practices

1. **Set expectations** - Clearly communicate that guest data isn't saved permanently
2. **Offer upgrade path** - Make it easy to create an account to save progress
3. **Limit anonymous features** - Consider restricting some features to authenticated users
4. **Backup data** - Offer guests a way to export their workout data before signing out
5. **Analytics tracking** - Tag guest events separately to understand conversion rates
