import React, { useEffect, useState } from 'react';
import {
  Alert, FlatList, Modal, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { GlassCard } from '@/components/GlassCard';
import { StatusBadge, PlatformBadge } from '@/components/StatusBadge';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';
import type { Device } from '@/types';

export default function DevicesScreen() {
  const colors = useColors();
  const { devices, selectedDevice, setSelectedDevice, favorites, toggleFavorite, testConnection } = useSimvyn();
  const { post, get } = useApi();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ios' | 'android'>('all');
  const [actionDevice, setActionDevice] = useState<Device | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => { setRefreshing(true); await testConnection(); setRefreshing(false); };

  const filtered = devices
    .filter((d) => filter === 'all' || d.platform === filter)
    .sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 0 : 1;
      const bFav = favorites.includes(b.id) ? 0 : 1;
      return aFav - bFav || (a.state === 'booted' ? -1 : 1);
    });

  const bootDevice = async (d: Device) => {
    try {
      await post('/device-management/boot', { deviceId: d.id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await testConnection();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const shutdownDevice = async (d: Device) => {
    Alert.alert('Shutdown', `Shutdown "${d.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Shutdown', style: 'destructive', onPress: async () => {
        try {
          await post('/device-management/shutdown', { deviceId: d.id });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await testConnection();
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const eraseDevice = async (d: Device) => {
    Alert.alert('Erase', `Erase all data on "${d.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase', style: 'destructive', onPress: async () => {
        try {
          await post('/device-management/erase', { deviceId: d.id });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const renderDevice = ({ item }: { item: Device }) => {
    const isFav = favorites.includes(item.id);
    const isSelected = selectedDevice?.id === item.id;
    return (
      <TouchableOpacity
        onPress={() => setSelectedDevice(item)}
        onLongPress={() => setActionDevice(item)}
        style={[styles.devCard, {
          backgroundColor: isSelected ? colors.primary + '18' : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
          borderRadius: colors.radius,
        }]}
        activeOpacity={0.8}
      >
        <View style={styles.devLeft}>
          <MaterialCommunityIcons
            name={item.platform === 'ios' ? 'apple' : 'android'}
            size={20}
            color={item.platform === 'ios' ? colors.primary : colors.statusAndroid}
          />
          <View style={{ flex: 1 }}>
            <View style={styles.devTitleRow}>
              <Text style={[styles.devName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
              {isFav && <Feather name="star" size={11} color="#f5c842" />}
            </View>
            <Text style={[styles.devSub, { color: colors.mutedForeground }]}>
              {item.deviceType} · {item.osVersion}
            </Text>
          </View>
        </View>
        <View style={styles.devRight}>
          <StatusBadge state={item.state} />
          {item.state === 'shutdown' ? (
            <TouchableOpacity onPress={() => bootDevice(item)} style={[styles.actionBtn, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
              <Feather name="play" size={12} color={colors.primary} />
            </TouchableOpacity>
          ) : item.state === 'booted' ? (
            <TouchableOpacity onPress={() => shutdownDevice(item)} style={[styles.actionBtn, { backgroundColor: colors.destructive + '22', borderColor: colors.destructive }]}>
              <Feather name="square" size={12} color={colors.destructive} />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Filter tabs */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        {(['all', 'ios', 'android'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, { borderBottomColor: filter === f ? colors.primary : 'transparent' }]}
          >
            <Text style={[styles.filterLabel, { color: filter === f ? colors.primary : colors.mutedForeground }]}>
              {f === 'all' ? 'All' : f === 'ios' ? 'iOS' : 'Android'}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={[styles.createBtn, { backgroundColor: colors.primary + '22', borderRadius: 8, borderColor: colors.primary }]}>
          <Feather name="plus" size={14} color={colors.primary} />
          <Text style={[styles.createLabel, { color: colors.primary }]}>New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderDevice}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={<EmptyState icon="smartphone" title="No Devices" subtitle="No devices found. Boot a simulator or connect a device." />}
      />

      {/* Action sheet modal */}
      <Modal visible={!!actionDevice} transparent animationType="slide" onRequestClose={() => setActionDevice(null)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setActionDevice(null)} activeOpacity={1}>
          <View style={[styles.actionSheet, { backgroundColor: colors.elevated, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{actionDevice?.name}</Text>
            <Text style={[styles.sheetSub, { color: colors.mutedForeground }]}>{actionDevice?.platform} · {actionDevice?.osVersion}</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.sheetItem} onPress={() => { toggleFavorite(actionDevice!.id); setActionDevice(null); }}>
              <Feather name="star" size={16} color={favorites.includes(actionDevice?.id ?? '') ? '#f5c842' : colors.foreground} />
              <Text style={[styles.sheetItemText, { color: colors.foreground }]}>
                {favorites.includes(actionDevice?.id ?? '') ? 'Remove Favorite' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={() => { eraseDevice(actionDevice!); setActionDevice(null); }}>
              <Feather name="trash-2" size={16} color={colors.destructive} />
              <Text style={[styles.sheetItemText, { color: colors.destructive }]}>Erase Device</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={() => setActionDevice(null)}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
              <Text style={[styles.sheetItemText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filterRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingHorizontal: 14 },
  filterTab: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 2, marginBottom: -1 },
  filterLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, marginRight: 4 },
  createLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  list: { padding: 12, gap: 8, paddingBottom: 40 },
  devCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, gap: 10 },
  devLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  devTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  devName: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1 },
  devSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  devRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  actionSheet: { padding: 20, paddingBottom: 40 },
  sheetTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  sheetSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2, marginBottom: 12 },
  divider: { height: 1, marginVertical: 8 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  sheetItemText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
});
