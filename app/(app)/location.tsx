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

const PRESETS = [
  { label: 'San Francisco', lat: '37.7749', lng: '-122.4194' },
  { label: 'New York', lat: '40.7128', lng: '-74.0060' },
  { label: 'London', lat: '51.5074', lng: '-0.1278' },
  { label: 'Tokyo', lat: '35.6762', lng: '139.6503' },
  { label: 'Istanbul', lat: '41.0082', lng: '28.9784' },
  { label: 'Ankara', lat: '39.9334', lng: '32.8597' },
];

export default function LocationScreen() {
  const colors = useColors();
  const { selectedDevice } = useSimvyn();
  const { post, get } = useApi();
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [setting, setSetting] = useState(false);

  if (!selectedDevice) return <EmptyState icon="map-pin" title="No Device Selected" subtitle="Select a device to simulate GPS location." />;

  const setLocation = async (latitude: string, longitude: string) => {
    setSetting(true);
    try {
      await post('/location/set', {
        deviceId: selectedDevice.id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `Location set to ${latitude}, ${longitude}`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSetting(false);
  };

  const clearLocation = async () => {
    try {
      await post('/location/clear', { deviceId: selectedDevice.id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await get(`/location/search?query=${encodeURIComponent(searchQuery)}`);
      if (data?.lat && data?.lng) {
        setLat(String(data.lat));
        setLng(String(data.lng));
      }
    } catch (_) {}
    setSearching(false);
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <SectionHeader title="Search Address" />
      <GlassCard>
        <View style={styles.searchRow}>
          <View style={[styles.searchInput, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8, flex: 1 }]}>
            <Feather name="search" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search address..."
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="search"
              onSubmitEditing={searchLocation}
            />
          </View>
          <TouchableOpacity
            onPress={searchLocation}
            disabled={searching}
            style={[styles.searchBtn, { backgroundColor: colors.primary, borderRadius: 8, opacity: searching ? 0.7 : 1 }]}
          >
            <Feather name={searching ? 'loader' : 'search'} size={14} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      <SectionHeader title="Coordinates" />
      <GlassCard>
        <View style={styles.coordRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.coordLabel, { color: colors.mutedForeground }]}>Latitude</Text>
            <TextInput
              style={[styles.coordInput, { color: colors.foreground, backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}
              value={lat}
              onChangeText={setLat}
              placeholder="37.7749"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.coordLabel, { color: colors.mutedForeground }]}>Longitude</Text>
            <TextInput
              style={[styles.coordInput, { color: colors.foreground, backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}
              value={lng}
              onChangeText={setLng}
              placeholder="-122.4194"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity
            onPress={() => setLocation(lat, lng)}
            disabled={setting || !lat || !lng}
            style={[styles.setBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, flex: 1, opacity: !lat || !lng ? 0.5 : 1 }]}
          >
            <Feather name="map-pin" size={14} color={colors.primaryForeground} />
            <Text style={[styles.setBtnText, { color: colors.primaryForeground }]}>{setting ? 'Setting...' : 'Set Location'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={clearLocation}
            style={[styles.clearBtn, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      <SectionHeader title="Quick Presets" />
      <View style={styles.presetGrid}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            onPress={() => { setLat(p.lat); setLng(p.lng); setLocation(p.lat, p.lng); }}
            style={[styles.presetBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <Feather name="map-pin" size={14} color={colors.teal} />
            <Text style={[styles.presetLabel, { color: colors.foreground }]}>{p.label}</Text>
            <Text style={[styles.presetCoords, { color: colors.mutedForeground }]}>{p.lat}, {p.lng}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1 },
  input: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', padding: 0 },
  searchBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  coordRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  coordLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', letterSpacing: 0.5, marginBottom: 4 },
  coordInput: { fontSize: 14, fontFamily: 'Inter_400Regular', padding: 10, borderWidth: 1 },
  btnRow: { flexDirection: 'row', gap: 8 },
  setBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
  setBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  clearBtn: { width: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: { width: '48%', padding: 12, gap: 4, borderWidth: 1 },
  presetLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  presetCoords: { fontSize: 10, fontFamily: 'Inter_400Regular' },
});
