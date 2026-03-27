import { View, Text } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';

export default function NotificationSettings() {
  const posthog = usePostHog();
  useFocusEffect(
    useCallback(() => {
      posthog.capture('screen_view', { screen: 'send_feedback_modal', section: 'modal' });
    }, [posthog])
  );
    
  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
        <SectionHeader title="We'd Love to Hear From You!"/>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>MODAL PAGE IS COMING SOON....</Text>

    </View>
  );
}