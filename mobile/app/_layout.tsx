import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* index.tsx dosyasını ana ekran yap ve üstteki başlığı gizle */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}