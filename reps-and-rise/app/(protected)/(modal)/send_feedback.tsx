import { View, Text } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";

export default function NotificationSettings() {
    
  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
        <SectionHeader title="We'd Love to Hear From You!"/>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>MODAL PAGE IS COMING SOON....</Text>

    </View>
  );
}