import React, { useState } from 'react';
import {
  Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { StatusBadge, PlatformBadge } from './StatusBadge';

export function TopBar({ title }: { title?: string }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { devices, selectedDevice, setSelectedDevice, wsConnected, isConnected } = useSimvyn();
  const [showPicker, setShowPicker] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <>
      <View style={[styles.bar, {
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
        paddingTop: topPad + 8,
        paddingHorizontal: 14,
        paddingBottom: 10,
      }]}>
        <View style={styles.left}>
          {title && (
            <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          )}
        </View>
        <View style={styles.right}>
          {/* Connection indicator */}
          <View style={[styles.connBadge, { backgroundColor: colors.elevated }]}>
            <View style={[styles.connDot, { backgroundColor: isConnected ? colors.statusBooted : colors.statusShutdown }]} />
            <Text style={[styles.connLabel, { color: colors.mutedForeground }]}>
              {wsConnected ? 'Live' : isConnected ? 'Connected' : 'Offline'}
            </Text>
          </View>
          {/* Device selector */}
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={[styles.deviceBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
          >
            {selectedDevice ? (
              <>
                <MaterialCommunityIcons
                  name={selectedDevice.platform === 'ios' ? 'apple' : 'android'}
                  size={14}
                  color={selectedDevice.platform === 'ios' ? colors.primary : colors.statusAndroid}
                />
                <Text style={[styles.deviceName, { color: colors.foreground }]} numberOfLines={1}>
                  {selectedDevice.name}
                </Text>
                <StatusBadge state={selectedDevice.state} small />
              </>
            ) : (
              <>
                <Feather name="smartphone" size={13} color={colors.mutedForeground} />
                <Text style={[styles.deviceName, { color: colors.mutedForeground }]}>Select Device</Text>
              </>
            )}
            <Feather name="chevron-down" size={12} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setShowPicker(false)} activeOpacity={1}>
          <View style={[styles.picker, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.pickerTitle, { color: colors.mutedForeground }]}>SELECT DEVICE</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {devices.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No devices found</Text>
              )}
              {devices.map((dev) => (
                <TouchableOpacity
                  key={dev.id}
                  style={[styles.devRow, { borderBottomColor: colors.border,
                    backgroundColor: selectedDevice?.id === dev.id ? colors.surface : 'transparent' }]}
                  onPress={() => { setSelectedDevice(dev); setShowPicker(false); }}
                >
                  <MaterialCommunityIcons
                    name={dev.platform === 'ios' ? 'apple' : 'android'}
                    size={16}
                    color={dev.platform === 'ios' ? colors.primary : colors.statusAndroid}
                  />
                  <View style={styles.devInfo}>
                    <Text style={[styles.devName, { color: colors.foreground }]}>{dev.name}</Text>
                    <Text style={[styles.devSub, { color: colors.mutedForeground }]}>
                      {dev.deviceType} · {dev.osVersion}
                    </Text>
                  </View>
                  <StatusBadge state={dev.state} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1 },
  left: { flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  connBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  connDot: { width: 6, height: 6, borderRadius: 3 },
  connLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  deviceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, maxWidth: 220,
  },
  deviceName: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingRight: 14 },
  picker: { width: 300, borderWidth: 1, overflow: 'hidden' },
  pickerTitle: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2, padding: 12, paddingBottom: 6 },
  devRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 1 },
  devInfo: { flex: 1 },
  devName: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  devSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  emptyText: { textAlign: 'center', padding: 20, fontFamily: 'Inter_400Regular', fontSize: 13 },
});
