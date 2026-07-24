import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';

const DEFAULT_PAYLOAD = JSON.stringify({
  aps: {
    alert: { title: 'Test Notification', body: 'Hello from Simvyn!' },
    sound: 'default',
    badge: 1,
  },
}, null, 2);

const TEMPLATES = [
  { name: 'Basic Alert', payload: DEFAULT_PAYLOAD },
  {
    name: 'Silent Push',
    payload: JSON.stringify({ aps: { 'content-available': 1 }, data: { action: 'refresh' } }, null, 2),
  },
  {
    name: 'Rich Notification',
    payload: JSON.stringify({
      aps: { alert: { title: 'Update Available', body: 'Tap to install v2.0', subtitle: 'App Name' }, sound: 'default' },
    }, null, 2),
  },
];

export default function PushScreen() {
  const colors = useColors();
  const { selectedDevice } = useSimvyn();
  const { post, get } = useApi();
  const [bundleId, setBundleId] = useState('');
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [sending, setSending] = useState(false);
  const [payloadError, setPayloadError] = useState<string | null>(null);

  const validatePayload = (text: string) => {
    try { JSON.parse(text); setPayloadError(null); } catch (e: any) { setPayloadError(e.message); }
    setPayload(text);
  };

  const sendPush = async () => {
    if (!selectedDevice || !bundleId) { Alert.alert('Error', 'Bundle ID required'); return; }
    try { JSON.parse(payload); } catch { Alert.alert('Invalid JSON', 'Fix payload JSON before sending'); return; }
    setSending(true);
    try {
      await post('/push/send', { deviceId: selectedDevice.id, bundleId, payload: JSON.parse(payload) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sent', 'Push notification delivered to device.');
    } catch (e: any) { Alert.alert('Error', e.message); }
    setSending(false);
  };

  if (!selectedDevice) return <EmptyState icon="bell" title="No Device Selected" subtitle="Select an iOS simulator to send push notifications." />;

  return (
    <ScrollView style={[{ backgroundColor: colors.background }]} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      <SectionHeader title="Templates" />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {TEMPLATES.map((t) => (
          <TouchableOpacity
            key={t.name}
            onPress={() => setPayload(t.payload)}
            style={[styles.templateBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 8 }]}
          >
            <Feather name="file-text" size={12} color={colors.teal} />
            <Text style={[styles.templateLabel, { color: colors.foreground }]}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionHeader title="Target App" />
      <GlassCard style={{ marginBottom: 14 }}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Bundle ID</Text>
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
      </GlassCard>

      <SectionHeader title="Payload (JSON)" />
      <GlassCard style={{ marginBottom: 14 }}>
        <TextInput
          style={[styles.payloadInput, {
            color: colors.foreground,
            backgroundColor: colors.elevated,
            borderColor: payloadError ? colors.destructive : colors.border,
            borderRadius: 8,
            fontFamily: 'Inter_400Regular',
          }]}
          value={payload}
          onChangeText={validatePayload}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
        />
        {payloadError && (
          <Text style={[styles.errorText, { color: colors.destructive }]}>{payloadError}</Text>
        )}
      </GlassCard>

      <TouchableOpacity
        onPress={sendPush}
        disabled={sending || !!payloadError}
        style={[styles.sendBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: sending || !!payloadError ? 0.6 : 1 }]}
      >
        <Feather name="send" size={16} color={colors.primaryForeground} />
        <Text style={[styles.sendBtnText, { color: colors.primaryForeground }]}>{sending ? 'Sending...' : 'Send Push'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1, marginBottom: 6 },
  templateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderWidth: 1 },
  templateLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1 },
  input: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', padding: 0 },
  payloadInput: { fontSize: 12, padding: 12, borderWidth: 1, minHeight: 180 },
  errorText: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  sendBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
