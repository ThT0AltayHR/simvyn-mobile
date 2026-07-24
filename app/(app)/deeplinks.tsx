import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';
import type { DeepLink } from '@/types';

const EXAMPLES = [
  'myapp://home', 'myapp://settings', 'https://example.com/path',
  'tel://+1234567890', 'mailto://test@test.com',
];

export default function DeepLinksScreen() {
  const colors = useColors();
  const { selectedDevice } = useSimvyn();
  const { post, get } = useApi();
  const [url, setUrl] = useState('');
  const [bundleId, setBundleId] = useState('');
  const [sending, setSending] = useState(false);
  const [favorites, setFavorites] = useState<DeepLink[]>([]);

  useEffect(() => {
    // Load favorites from AsyncStorage via API if available
  }, []);

  const openLink = async () => {
    if (!selectedDevice || !url) return;
    setSending(true);
    try {
      await post('/deep-links/open', { deviceId: selectedDevice.id, url, bundleId: bundleId || undefined });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setSending(false);
  };

  if (!selectedDevice) return <EmptyState icon="link" title="No Device Selected" subtitle="Select a device to open deep links." />;

  return (
    <FlatList
      style={[{ backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 14, paddingBottom: 40, gap: 0 }}
      data={EXAMPLES}
      keyExtractor={(i) => i}
      ListHeaderComponent={
        <>
          <SectionHeader title="Open URL / Deep Link" />
          <GlassCard style={{ marginBottom: 14 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>URL or Deep Link</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}>
              <Feather name="link" size={14} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={url}
                onChangeText={setUrl}
                placeholder="myapp://route or https://..."
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 10 }]}>Bundle ID (optional)</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}>
              <Feather name="package" size={14} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={bundleId}
                onChangeText={setBundleId}
                placeholder="com.example.app"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              onPress={openLink}
              disabled={sending || !url}
              style={[styles.openBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: !url ? 0.5 : 1 }]}
            >
              <Feather name="external-link" size={15} color={colors.primaryForeground} />
              <Text style={[styles.openBtnText, { color: colors.primaryForeground }]}>{sending ? 'Opening...' : 'Open Link'}</Text>
            </TouchableOpacity>
          </GlassCard>
          <SectionHeader title="Quick Examples" />
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => setUrl(item)}
          style={[styles.exampleRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, marginBottom: 6 }]}
        >
          <Feather name="link-2" size={13} color={colors.teal} />
          <Text style={[styles.exampleText, { color: colors.foreground }]} numberOfLines={1}>{item}</Text>
          <Feather name="arrow-up-left" size={13} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, marginBottom: 4 },
  input: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', padding: 0 },
  openBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, marginTop: 10 },
  openBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1 },
  exampleText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular' },
});
