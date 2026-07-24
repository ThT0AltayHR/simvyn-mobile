import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';

export default function ToolSettingsScreen() {
  const colors = useColors();
  const { serverUrl, setServerUrl, isConnected, wsConnected, devices } = useSimvyn();
  const { get, del } = useApi();
  const [editUrl, setEditUrl] = useState(serverUrl);
  const [editMode, setEditMode] = useState(false);
  const [storage, setStorage] = useState<{ total?: string } | null>(null);

  const loadStorage = async () => {
    try { const d = await get('/api/tool-settings/storage'); setStorage(d); } catch (_) {}
  };

  const wipeData = async () => {
    Alert.alert('Wipe All Data', 'This will delete all stored data from the Simvyn server. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Wipe', style: 'destructive', onPress: async () => {
        try {
          await del('/api/tool-settings/data');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Done', 'All server data wiped.');
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const disconnect = async () => {
    await AsyncStorage.removeItem('@simvyn/server_url');
    await setServerUrl('');
    router.replace('/');
  };

  const saveUrl = async () => {
    await setServerUrl(editUrl);
    setEditMode(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView style={[{ backgroundColor: colors.background }]} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      <SectionHeader title="Connection" />
      <GlassCard style={{ marginBottom: 14 }}>
        <View style={styles.infoRow}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.statusBooted : colors.destructive }]} />
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Status</Text>
          <Text style={[styles.infoValue, { color: colors.foreground }]}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.statusDot, { backgroundColor: wsConnected ? colors.statusBooted : colors.mutedForeground }]} />
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>WebSocket</Text>
          <Text style={[styles.infoValue, { color: colors.foreground }]}>{wsConnected ? 'Live' : 'Not connected'}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {editMode ? (
          <>
            <TextInput
              style={[styles.urlInput, { color: colors.foreground, backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}
              value={editUrl}
              onChangeText={setEditUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity onPress={saveUrl} style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: 8, flex: 1 }]}>
                <Text style={[{ color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold', fontSize: 13 }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditMode(false)} style={[styles.saveBtn, { backgroundColor: colors.elevated, borderRadius: 8 }]}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity onPress={() => setEditMode(true)} style={styles.urlRow}>
            <Feather name="server" size={13} color={colors.mutedForeground} />
            <Text style={[styles.urlText, { color: colors.foreground }]}>{serverUrl}</Text>
            <Feather name="edit-2" size={13} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </GlassCard>

      <SectionHeader title="Stats" />
      <GlassCard style={{ marginBottom: 14 }}>
        <View style={styles.infoRow}>
          <Feather name="smartphone" size={14} color={colors.teal} />
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Total Devices</Text>
          <Text style={[styles.infoValue, { color: colors.foreground }]}>{devices.length}</Text>
        </View>
        <TouchableOpacity onPress={loadStorage} style={styles.infoRow}>
          <Feather name="hard-drive" size={14} color={colors.accent} />
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Storage Used</Text>
          <Text style={[styles.infoValue, { color: colors.foreground }]}>{storage?.total ?? 'Tap to check'}</Text>
        </TouchableOpacity>
      </GlassCard>

      <SectionHeader title="Danger Zone" />
      <GlassCard>
        <TouchableOpacity onPress={wipeData} style={[styles.dangerBtn, { borderBottomColor: colors.border }]}>
          <Feather name="trash-2" size={16} color={colors.destructive} />
          <Text style={[styles.dangerLabel, { color: colors.destructive }]}>Wipe All Server Data</Text>
          <Feather name="chevron-right" size={14} color={colors.destructive} />
        </TouchableOpacity>
        <TouchableOpacity onPress={disconnect} style={styles.dangerBtn}>
          <Feather name="log-out" size={16} color={colors.mutedForeground} />
          <Text style={[styles.dangerLabel, { color: colors.mutedForeground }]}>Disconnect Server</Text>
          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </GlassCard>

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        AltayHR Developer · turkhackteam.org{'\n'}Simvyn Mobile v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  infoLabel: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  divider: { height: 1, marginVertical: 8 },
  urlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urlText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular' },
  urlInput: { fontSize: 13, fontFamily: 'Inter_400Regular', padding: 10, borderWidth: 1 },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  dangerLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  footer: { textAlign: 'center', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 32, lineHeight: 18 },
});
