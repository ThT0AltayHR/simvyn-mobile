import React, { useEffect, useState } from 'react';
import {
  Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';
import type { Screenshot } from '@/types';

export default function ScreenshotScreen() {
  const colors = useColors();
  const { selectedDevice, serverUrl } = useSimvyn();
  const { post, get } = useApi();
  const [history, setHistory] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await get('/screenshot/history');
      setHistory(Array.isArray(data) ? data : data.items ?? []);
    } catch (_) {}
  };

  useEffect(() => {
    loadHistory();
  }, [selectedDevice?.id]);

  const capture = async () => {
    if (!selectedDevice) return;
    setCapturing(true);
    try {
      await post(`/screenshot/capture/${selectedDevice.id}`, {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadHistory();
    } catch (e: any) { Alert.alert('Error', e.message); }
    setCapturing(false);
  };

  const startRecording = async () => {
    if (!selectedDevice) return;
    setRecording(true);
    try {
      await post(`/screenshot/record/start/${selectedDevice.id}`, {});
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e: any) { setRecording(false); Alert.alert('Error', e.message); }
  };

  const stopRecording = async () => {
    if (!selectedDevice) return;
    try {
      await post(`/screenshot/record/stop/${selectedDevice.id}`, {});
      setRecording(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadHistory();
    } catch (e: any) { Alert.alert('Error', e.message); setRecording(false); }
  };

  const onRefresh = async () => { setRefreshing(true); await loadHistory(); setRefreshing(false); };

  if (!selectedDevice) return <EmptyState icon="camera" title="No Device Selected" subtitle="Select a booted device to take screenshots." />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Action bar */}
      <View style={[styles.actionBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={capture}
          disabled={capturing}
          style={[styles.captureBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: capturing ? 0.7 : 1 }]}
        >
          <Feather name="camera" size={16} color={colors.primaryForeground} />
          <Text style={[styles.captureBtnText, { color: colors.primaryForeground }]}>{capturing ? 'Capturing...' : 'Screenshot'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={[styles.recordBtn, {
            backgroundColor: recording ? colors.destructive + '22' : colors.elevated,
            borderColor: recording ? colors.destructive : colors.border,
            borderRadius: colors.radius,
          }]}
        >
          <View style={[styles.recordDot, { backgroundColor: recording ? colors.destructive : colors.mutedForeground }]} />
          <Text style={[styles.recordBtnText, { color: recording ? colors.destructive : colors.mutedForeground }]}>
            {recording ? 'Stop Rec' : 'Record'}
          </Text>
        </TouchableOpacity>
      </View>

      <SectionHeader title={`History (${history.length})`} />
      <FlatList
        data={history}
        keyExtractor={(i) => i.filename}
        numColumns={3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        scrollEnabled={!!history.length}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={[styles.thumb, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={[styles.thumbImg, { backgroundColor: colors.elevated }]}>
              <Feather name={item.type === 'recording' ? 'video' : 'image'} size={24} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.thumbName, { color: colors.mutedForeground }]} numberOfLines={2}>{item.filename}</Text>
            <View style={[styles.typeBadge, { backgroundColor: item.type === 'recording' ? colors.destructive + '33' : colors.primary + '33', borderRadius: 4 }]}>
              <Text style={[styles.typeLabel, { color: item.type === 'recording' ? colors.destructive : colors.primary }]}>
                {item.type === 'recording' ? 'VID' : 'IMG'}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="image" title="No Captures" subtitle="Take a screenshot or record your device screen." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  actionBar: { flexDirection: 'row', gap: 10, padding: 12, borderBottomWidth: 1 },
  captureBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  captureBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  recordBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  recordDot: { width: 10, height: 10, borderRadius: 5 },
  recordBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  grid: { padding: 10, gap: 8, paddingBottom: 40 },
  thumb: { flex: 1, margin: 3, padding: 8, borderWidth: 1, alignItems: 'center', gap: 5, maxWidth: '31%' },
  thumbImg: { width: '100%', aspectRatio: 0.56, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  thumbName: { fontSize: 9, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2 },
  typeLabel: { fontSize: 9, fontFamily: 'Inter_600SemiBold' },
});
