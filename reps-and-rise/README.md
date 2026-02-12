# Expo Supabase Auth Starter

A modern, full-stack mobile and web application starter built with **Expo**,
**Supabase**, **TypeScript**, and **Gluestack UI v2**. This starter provides a
complete authentication system with user profiles, avatar uploads, and a
beautiful, responsive interface that works seamlessly across iOS, Android, and
web platforms.

## ✨ Features

### 🔐 Authentication

- **Email/Password Authentication** with Supabase Auth
- **Secure user sessions** with automatic token refresh
- **Protected routes** with role-based access
- **Sign up, sign in, and sign out** functionality
- **Password reset** (coming soon)

### 👤 User Profiles

- **Complete user profile management** (first name, last name, email)
- **Avatar upload and management** with image optimization
- **Automatic profile creation** on user registration
- **Real-time profile updates** with optimistic UI
- **Cross-platform image picker** (camera and photo library)

### 🎨 Modern UI/UX

- **Gluestack UI v2** components for consistent design
- **Tailwind CSS** for custom styling
- **Dark/Light mode** support
- **Responsive design** for all screen sizes
- **Native feel** across all platforms
- **Smooth animations** and transitions

### 🏗️ Technical Features

- **TypeScript** for type safety
- **Expo Router** for file-based routing
- **Row Level Security (RLS)** for data protection
- **Real-time data synchronization**
- **Optimized image upload** with compression
- **Cross-platform compatibility** (iOS, Android, Web)
- **Hot reload** development experience

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g @expo/cli`)
- **Supabase account** (free tier available)
- **iOS Simulator** (Mac) or **Android Emulator** for mobile development

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/expo-supabase-auth-starter.git
cd expo-supabase-auth-starter

# Install dependencies
npm install

# Start the development server
npm start
```

### 2. Supabase Setup

#### Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project" and fill in your project details
3. Wait for the project to be created (usually takes 1-2 minutes)

#### Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env.local` file in your project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `scripts/complete-setup.sql`
3. Paste and run the SQL script

This will:

- Create the `profiles` table with proper security policies
- Set up Row Level Security (RLS)
- Create the `avatars` storage bucket
- Configure storage policies for avatar uploads
- Set up automatic profile creation triggers

#### Verify Storage Setup

1. Go to **Storage** in your Supabase dashboard
2. Confirm the `avatars` bucket exists and is public
3. Check that storage policies are properly configured

### 3. Test Your Setup

```bash
# Start the development server
npm start

# Choose your platform:
# - Press 'i' for iOS Simulator
# - Press 'a' for Android Emulator
# - Press 'w' for Web Browser
```

1. **Create an account** using the sign-up form
2. **Verify the profile** was created in Supabase
3. **Upload an avatar** from the profile screen
4. **Update your name** and see changes sync

## 📱 App Structure

```
expo-supabase-auth-starter/
├── app/                          # Expo Router pages
│   ├── (protected)/             # Protected routes (require auth)
│   │   └── (tabs)/             # Tab navigation
│   │       ├── index.tsx       # Home screen
│   │       ├── profile.tsx     # Profile management
│   │       └── two.tsx         # Second tab
│   ├── sign-in.tsx             # Sign in screen
│   ├── sign-up.tsx             # Sign up screen
│   └── welcome.tsx             # Welcome/landing screen
├── components/                  # Reusable UI components
│   └── ui/                     # Gluestack UI components
├── context/                    # React Context providers
│   ├── auth-provider.tsx       # Authentication context
│   └── user-provider.tsx       # User profile context
├── lib/                        # Utilities and configurations
│   ├── supabase.ts            # Supabase client setup
│   ├── image-upload.ts        # Image upload utilities
│   └── types.ts               # TypeScript interfaces
├── scripts/                    # Database setup scripts
│   └── complete-setup.sql     # Complete database setup
└── docs/                      # Documentation
    └── *.md                   # Feature-specific guides
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web

# Testing
npm test          # Run tests with Jest

# Code Quality
npm run lint      # Run ESLint (when configured)
npm run format    # Run Prettier (when configured)
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Development settings
DARK_MODE=media    # 'light', 'dark', or 'media'
```

### Key Configuration Files

- **`app.json`** - Expo app configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`gluestack-ui.config.json`** - Gluestack UI theme
- **`tsconfig.json`** - TypeScript configuration

## 🔧 Customization

### Styling

The app uses **Gluestack UI v2** + **Tailwind CSS**:

```tsx
// Using Gluestack UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Using Tailwind classes
<View className="flex-1 p-4 bg-gray-50">
  <Text className="text-xl font-bold text-gray-900">Welcome!</Text>
</View>;
```

### Adding New Features

1. **Database Changes**: Add SQL to `scripts/complete-setup.sql`
2. **Types**: Update interfaces in `lib/types.ts`
3. **API Layer**: Extend `lib/supabase.ts`
4. **UI Components**: Add to `components/ui/`
5. **Screens**: Add to `app/` directory

### Theme Customization

Edit `gluestack-ui.config.json` and `tailwind.config.js` to customize:

- Colors
- Typography
- Spacing
- Components

## 🔒 Security

This starter implements security best practices:

- **Row Level Security (RLS)** on all tables
- **User isolation** - users can only access their own data
- **Secure storage policies** for file uploads
- **Environment variable protection**
- **Type-safe API calls**
- **Input validation** and sanitization

## 📚 Documentation

Detailed guides are available in the `docs/` directory:

- **Avatar Upload Setup** - Complete guide for avatar functionality
- **User Profile Management** - Profile system architecture
- **Supabase Configuration** - Advanced Supabase setup

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🆘 Support

- **Issues**:
  [GitHub Issues](https://github.com/your-username/expo-supabase-auth-starter/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/your-username/expo-supabase-auth-starter/discussions)
- **Documentation**: Check the `docs/` folder for detailed guides

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Expo](https://expo.dev) - The fastest way to build native apps
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Gluestack UI](https://gluestack.io) - Universal component library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [React Native](https://reactnative.dev) - Cross-platform mobile development

---

**Happy coding!** 🚀
