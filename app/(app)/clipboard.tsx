import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';

export default function ClipboardScreen() {
  const colors = useColors();
  const { selectedDevice } = useSimvyn();
  const { get, post } = useApi();
  const [deviceClipboard, setDeviceClipboard] = useState('');
  const [toWrite, setToWrite] = useState('');
  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);

  const readClipboard = async () => {
    if (!selectedDevice) return;
    setReading(true);
    try {
      const data = await get(`/clipboard/get/${selectedDevice.id}`);
      setDeviceClipboard(data?.content ?? data ?? '');
    } catch (e: any) { Alert.alert('Error', e.message); }
    setReading(false);
  };

  const writeClipboard = async () => {
    if (!selectedDevice || !toWrite) return;
    setWriting(true);
    try {
      await post(`/clipboard/set/${selectedDevice.id}`, { content: toWrite });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Done', 'Clipboard updated on device.');
    } catch (e: any) { Alert.alert('Error', e.message); }
    setWriting(false);
  };

  if (!selectedDevice) return <EmptyState icon="clipboard" title="No Device Selected" subtitle="Select a device to read/write clipboard." />;

  return (
    <ScrollView style={[{ backgroundColor: colors.background }]} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      <SectionHeader title="Device Clipboard" />
      <GlassCard style={{ marginBottom: 14 }}>
        <View style={[styles.clipDisplay, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}>
          <Text style={[styles.clipText, { color: deviceClipboard ? colors.foreground : colors.mutedForeground }]}>
            {deviceClipboard || 'Clipboard is empty or not read yet...'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={readClipboard}
          disabled={reading}
          style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius, marginTop: 10 }]}
        >
          <Feather name="clipboard" size={15} color={colors.primaryForeground} />
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>{reading ? 'Reading...' : 'Read from Device'}</Text>
        </TouchableOpacity>
      </GlassCard>

      <SectionHeader title="Write to Device" />
      <GlassCard>
        <TextInput
          style={[styles.writeInput, { color: colors.foreground, backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}
          value={toWrite}
          onChangeText={setToWrite}
          placeholder="Enter text to copy to device clipboard..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={writeClipboard}
          disabled={writing || !toWrite}
          style={[styles.btn, { backgroundColor: colors.teal, borderRadius: colors.radius, marginTop: 10, opacity: !toWrite ? 0.5 : 1 }]}
        >
          <Feather name="copy" size={15} color="#141420" />
          <Text style={[styles.btnText, { color: '#141420' }]}>{writing ? 'Writing...' : 'Write to Device'}</Text>
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  clipDisplay: { padding: 14, minHeight: 80, borderWidth: 1 },
  clipText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  btnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  writeInput: { fontSize: 13, fontFamily: 'Inter_400Regular', padding: 12, borderWidth: 1, minHeight: 100 },
});
