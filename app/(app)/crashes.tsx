import React, { useEffect, useState } from 'react';
import { FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import type { CrashLogEntry } from '@/types';

export default function CrashLogsScreen() {
  const colors = useColors();
  const { selectedDevice } = useSimvyn();
  const { get } = useApi();
  const [crashes, setCrashes] = useState<CrashLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CrashLogEntry | null>(null);
  const [detail, setDetail] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!selectedDevice) return;
    setLoading(true);
    try {
      const data = await get(`/crash-logs/list/${selectedDevice.id}`);
      setCrashes(Array.isArray(data) ? data : data.crashes ?? []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [selectedDevice?.id]);

  const viewCrash = async (crash: CrashLogEntry) => {
    setSelected(crash);
    try {
      const data = await get(`/crash-logs/view/${selectedDevice!.id}/${crash.id}`);
      setDetail(typeof data === 'string' ? data : data.content ?? JSON.stringify(data, null, 2));
    } catch (_) { setDetail(crash.preview); }
  };

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!selectedDevice) return <EmptyState icon="alert-triangle" title="No Device Selected" subtitle="Select a device to view crash logs." />;
  if (loading) return <LoadingState label="Loading crash logs..." />;

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }]}>
      <FlatList
        data={crashes}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        scrollEnabled={!!crashes.length}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => viewCrash(item)}
            style={[styles.crashCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <View style={[styles.crashIcon, { backgroundColor: colors.destructive + '22', borderRadius: 8 }]}>
              <Feather name="alert-circle" size={18} color={colors.destructive} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.processName, { color: colors.foreground }]}>{item.process}</Text>
              <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>{item.timestamp}</Text>
              <Text style={[styles.preview, { color: colors.mutedForeground }]} numberOfLines={2}>{item.preview}</Text>
            </View>
            <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="check-circle" title="No Crashes" subtitle="No crash logs found on this device." />}
      />

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{selected?.process}</Text>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }}>
            <Text style={[styles.crashDetail, { color: colors.foreground }]}>{detail}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  crashCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, gap: 10, borderWidth: 1 },
  crashIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  processName: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  timestamp: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  preview: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3, lineHeight: 16 },
  modalRoot: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', flex: 1, marginRight: 10 },
  crashDetail: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 18 },
});
