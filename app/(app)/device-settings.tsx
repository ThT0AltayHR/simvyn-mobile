import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';

const ORIENTATIONS = ['portrait', 'landscape', 'portraitUpsideDown', 'landscapeRight'];
const LOCALES = ['en_US', 'tr_TR', 'de_DE', 'fr_FR', 'ja_JP', 'zh_CN', 'ko_KR'];

export default function DeviceSettingsScreen() {
  const colors = useColors();
  const { selectedDevice } = useSimvyn();
  const { post } = useApi();
  const [darkMode, setDarkMode] = useState(false);
  const [toggling, setToggling] = useState(false);

  const call = async (path: string, body: unknown, successMsg?: string) => {
    try {
      await post(path, body);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (successMsg) Alert.alert('Done', successMsg);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const toggleAppearance = async (value: boolean) => {
    setToggling(true);
    setDarkMode(value);
    await call('/device-settings/appearance', { deviceId: selectedDevice!.id, mode: value ? 'dark' : 'light' });
    setToggling(false);
  };

  if (!selectedDevice) return <EmptyState icon="sliders" title="No Device Selected" subtitle="Select a device to change its settings." />;

  return (
    <ScrollView style={[{ backgroundColor: colors.background }]} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      <SectionHeader title="Appearance" />
      <GlassCard style={{ marginBottom: 14 }}>
        <View style={styles.settingRow}>
          <Feather name="moon" size={16} color={colors.accent} />
          <Text style={[styles.settingLabel, { color: colors.foreground }]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleAppearance}
            trackColor={{ false: colors.elevated, true: colors.primary }}
            thumbColor={darkMode ? colors.primaryForeground : colors.mutedForeground}
            disabled={toggling}
          />
        </View>
      </GlassCard>

      <SectionHeader title="Orientation" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {ORIENTATIONS.map((o) => (
          <TouchableOpacity
            key={o}
            onPress={() => call('/device-settings/orientation', { deviceId: selectedDevice.id, orientation: o })}
            style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 8 }]}
          >
            <Feather name="rotate-cw" size={12} color={colors.teal} />
            <Text style={[styles.chipText, { color: colors.foreground }]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionHeader title="Locale" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {LOCALES.map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => call('/device-settings/locale', { deviceId: selectedDevice.id, locale: l }, `Locale set to ${l}`)}
            style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 8 }]}
          >
            <Text style={[styles.chipText, { color: colors.foreground }]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionHeader title="Status Bar" />
      <GlassCard style={{ marginBottom: 14 }}>
        <TouchableOpacity
          onPress={() => call('/device-settings/status-bar/clear', { deviceId: selectedDevice.id }, 'Status bar reset')}
          style={[styles.actionRow, { borderBottomColor: colors.border }]}
        >
          <Feather name="refresh-cw" size={15} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.foreground }]}>Reset Status Bar</Text>
          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </GlassCard>

      <SectionHeader title="Accessibility" />
      <GlassCard>
        <TouchableOpacity
          onPress={() => call('/device-settings/increase-contrast', { deviceId: selectedDevice.id, enabled: true })}
          style={[styles.actionRow, { borderBottomColor: colors.border }]}
        >
          <Feather name="eye" size={15} color={colors.accent} />
          <Text style={[styles.actionLabel, { color: colors.foreground }]}>Toggle High Contrast</Text>
          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
        {selectedDevice.platform === 'android' && (
          <TouchableOpacity
            onPress={() => call('/device-settings/talkback', { deviceId: selectedDevice.id, enabled: true })}
            style={styles.actionRow}
          >
            <Feather name="volume-2" size={15} color={colors.teal} />
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>Toggle TalkBack</Text>
            <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  actionLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
});
