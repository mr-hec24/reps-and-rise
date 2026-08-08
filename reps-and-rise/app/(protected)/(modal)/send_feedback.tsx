import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useThemeMode } from '@/theme/ThemeContext';

export default function NotificationSettings() {
  const posthog = usePostHog();
  const { theme } = useThemeMode();
  const styles = getStyles(theme);
  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'send_feedback_modal', section: 'modal' });
    }, [posthog])
  );
    
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, gap: 12 }}>
        <SectionHeader title="We'd Love to Hear From You!"/>
        <Text style={{ fontSize: 24, fontWeight: "600" }}>MODAL PAGE IS COMING SOON....</Text>

      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => ({
});