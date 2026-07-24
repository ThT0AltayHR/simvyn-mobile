import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import type { AppInfo } from '@/types';

export default function AppsScreen() {
  const colors = useColors();
  const { selectedDevice } = useSimvyn();
  const { get, post } = useApi();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [actionApp, setActionApp] = useState<AppInfo | null>(null);

  const load = async () => {
    if (!selectedDevice) return;
    setLoading(true);
    try {
      const data = await get(`/app-management/list/${selectedDevice.id}`);
      setApps(Array.isArray(data) ? data : data.apps ?? []);
    } catch (_) { setApps([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [selectedDevice?.id]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const launchApp = async (app: AppInfo) => {
    try {
      await post('/app-management/launch', { deviceId: selectedDevice!.id, bundleId: app.bundleId });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const terminateApp = async (app: AppInfo) => {
    try {
      await post('/app-management/terminate', { deviceId: selectedDevice!.id, bundleId: app.bundleId });
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const uninstallApp = async (app: AppInfo) => {
    Alert.alert('Uninstall', `Uninstall "${app.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Uninstall', style: 'destructive', onPress: async () => {
        try {
          await post('/app-management/uninstall', { deviceId: selectedDevice!.id, bundleId: app.bundleId });
          setApps((prev) => prev.filter((a) => a.bundleId !== app.bundleId));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const clearData = async (app: AppInfo) => {
    Alert.alert('Clear Data', `Clear all data for "${app.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        try {
          await post('/app-management/clear-data', { deviceId: selectedDevice!.id, bundleId: app.bundleId });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  if (!selectedDevice) return <EmptyState icon="grid" title="No Device Selected" subtitle="Select a booted device to view installed apps." />;
  if (loading) return <LoadingState label="Loading apps..." />;

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.bundleId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}>
          <Feather name="search" size={13} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${apps.length} apps...`}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.bundleId}
        renderItem={({ item }) => (
          <View style={[styles.appRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, marginHorizontal: 12, marginVertical: 4 }]}>
            <View style={[styles.appIcon, { backgroundColor: colors.elevated, borderRadius: 10 }]}>
              <Feather name="package" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.appName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.bundleId, { color: colors.mutedForeground }]} numberOfLines={1}>{item.bundleId}</Text>
              {item.version && <Text style={[styles.version, { color: colors.mutedForeground }]}>v{item.version}</Text>}
            </View>
            <View style={styles.appActions}>
              <TouchableOpacity onPress={() => launchApp(item)} style={[styles.btn, { backgroundColor: colors.primary + '22', borderColor: colors.primary, borderRadius: 7 }]}>
                <Feather name="play" size={12} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => terminateApp(item)} style={[styles.btn, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 7 }]}>
                <Feather name="square" size={12} color={colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => clearData(item)} style={[styles.btn, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 7 }]}>
                <Feather name="trash" size={12} color={colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => uninstallApp(item)} style={[styles.btn, { backgroundColor: colors.destructive + '22', borderColor: colors.destructive, borderRadius: 7 }]}>
                <Feather name="x" size={12} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={<EmptyState icon="grid" title="No Apps Found" subtitle={search ? 'Try a different search term.' : 'No apps installed on this device.'} />}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { padding: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', padding: 0 },
  appRow: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 10, borderWidth: 1 },
  appIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  bundleId: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 1 },
  version: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 1 },
  appActions: { flexDirection: 'row', gap: 5 },
  btn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
