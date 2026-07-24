import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { GlassCard } from '@/components/GlassCard';
import { StatusBadge, PlatformBadge } from '@/components/StatusBadge';
import { SectionHeader } from '@/components/SectionHeader';
import type { HealthStatus } from '@/types';

export default function DashboardScreen() {
  const colors = useColors();
  const { devices, selectedDevice, serverUrl } = useSimvyn();
  const { get } = useApi();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const h = await get('/api/health');
      setHealth(h);
    } catch (_) {}
  };

  useEffect(() => { load(); }, [serverUrl]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const booted = devices.filter((d) => d.state === 'booted');
  const ios = devices.filter((d) => d.platform === 'ios');
  const android = devices.filter((d) => d.platform === 'android');

  const shortcuts = [
    { icon: 'terminal', label: 'Logs', route: '/(app)/logs' },
    { icon: 'camera', label: 'Screenshot', route: '/(app)/screenshot' },
    { icon: 'map-pin', label: 'Location', route: '/(app)/location' },
    { icon: 'clipboard', label: 'Clipboard', route: '/(app)/clipboard' },
    { icon: 'bell', label: 'Push', route: '/(app)/push' },
    { icon: 'database', label: 'Database', route: '/(app)/database' },
  ] as const;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Server health */}
      <SectionHeader title="Server" />
      <GlassCard style={styles.healthCard}>
        <View style={styles.healthRow}>
          <View style={styles.healthItem}>
            <Text style={[styles.healthVal, { color: colors.primary }]}>{health?.status ?? '—'}</Text>
            <Text style={[styles.healthKey, { color: colors.mutedForeground }]}>Status</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.healthItem}>
            <Text style={[styles.healthVal, { color: colors.teal }]}>{devices.length}</Text>
            <Text style={[styles.healthKey, { color: colors.mutedForeground }]}>Devices</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.healthItem}>
            <Text style={[styles.healthVal, { color: colors.statusBooted }]}>{booted.length}</Text>
            <Text style={[styles.healthKey, { color: colors.mutedForeground }]}>Booted</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.healthItem}>
            <Text style={[styles.healthVal, { color: colors.accent }]}>{health?.version ?? '—'}</Text>
            <Text style={[styles.healthKey, { color: colors.mutedForeground }]}>Version</Text>
          </View>
        </View>
        <Text style={[styles.serverUrl, { color: colors.mutedForeground }]}>{serverUrl}</Text>
      </GlassCard>

      {/* Selected device */}
      {selectedDevice && (
        <>
          <SectionHeader title="Active Device" />
          <GlassCard>
            <View style={styles.devRow}>
              <MaterialCommunityIcons
                name={selectedDevice.platform === 'ios' ? 'apple' : 'android'}
                size={26}
                color={selectedDevice.platform === 'ios' ? colors.primary : colors.statusAndroid}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.devName, { color: colors.foreground }]}>{selectedDevice.name}</Text>
                <Text style={[styles.devSub, { color: colors.mutedForeground }]}>
                  {selectedDevice.deviceType} · iOS/Android {selectedDevice.osVersion}
                </Text>
              </View>
              <StatusBadge state={selectedDevice.state} />
            </View>
          </GlassCard>
        </>
      )}

      {/* Shortcuts */}
      <SectionHeader title="Quick Access" />
      <View style={styles.grid}>
        {shortcuts.map((s) => (
          <TouchableOpacity
            key={s.route}
            onPress={() => router.push(s.route as any)}
            style={[styles.shortcut, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            activeOpacity={0.7}
          >
            <Feather name={s.icon} size={20} color={colors.primary} />
            <Text style={[styles.shortcutLabel, { color: colors.foreground }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Device platform split */}
      <SectionHeader title="Platform Overview" />
      <View style={styles.platformRow}>
        <GlassCard style={{ flex: 1 }}>
          <View style={styles.platformInner}>
            <MaterialCommunityIcons name="apple" size={22} color={colors.primary} />
            <Text style={[styles.platformCount, { color: colors.foreground }]}>{ios.length}</Text>
            <Text style={[styles.platformLabel, { color: colors.mutedForeground }]}>iOS Simulators</Text>
          </View>
        </GlassCard>
        <GlassCard style={{ flex: 1 }}>
          <View style={styles.platformInner}>
            <MaterialCommunityIcons name="android" size={22} color={colors.statusAndroid} />
            <Text style={[styles.platformCount, { color: colors.foreground }]}>{android.length}</Text>
            <Text style={[styles.platformLabel, { color: colors.mutedForeground }]}>Android Emulators</Text>
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  healthCard: { marginBottom: 2 },
  healthRow: { flexDirection: 'row', alignItems: 'center' },
  healthItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  healthVal: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  healthKey: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  divider: { width: 1, height: 32 },
  serverUrl: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 8, textAlign: 'center' },
  devRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  devName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  devSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  shortcut: { width: '30.5%', alignItems: 'center', padding: 14, gap: 8, borderWidth: 1 },
  shortcutLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  platformRow: { flexDirection: 'row', gap: 10 },
  platformInner: { alignItems: 'center', gap: 4, paddingVertical: 4 },
  platformCount: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  platformLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
});
