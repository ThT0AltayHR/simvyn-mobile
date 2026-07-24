import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { DeviceState, Platform } from '@/types';

interface StatusBadgeProps {
  state?: DeviceState;
  platform?: Platform;
  small?: boolean;
}

export function StatusBadge({ state, platform, small }: StatusBadgeProps) {
  const colors = useColors();

  const dotColor = state === 'booted' ? colors.statusBooted
    : state === 'creating' ? colors.accent
    : colors.statusShutdown;

  const label = state === 'booted' ? 'Booted'
    : state === 'creating' ? 'Creating'
    : state === 'shutting-down' ? 'Shutting Down'
    : 'Shutdown';

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dotColor, width: small ? 6 : 8, height: small ? 6 : 8, borderRadius: small ? 3 : 4 }]} />
      {!small && (
        <Text style={[styles.label, { color: dotColor, fontSize: 11 }]}>{label}</Text>
      )}
    </View>
  );
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  const colors = useColors();
  const color = platform === 'ios' ? colors.primary : colors.statusAndroid;
  return (
    <Text style={[styles.platformLabel, { color, borderColor: color }]}>
      {platform === 'ios' ? 'iOS' : 'Android'}
    </Text>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { borderRadius: 4 },
  label: { fontFamily: 'Inter_500Medium', letterSpacing: 0.3 },
  platformLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
});
