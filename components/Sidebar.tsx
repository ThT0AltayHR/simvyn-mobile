import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

interface NavItem {
  route: string;
  icon: React.ReactNode;
  label: string;
}

function NavIcon({ name, color, size = 20 }: { name: keyof typeof Feather.glyphMap; color: string; size?: number }) {
  return <Feather name={name} size={size} color={color} />;
}

export function Sidebar() {
  const colors = useColors();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const items: NavItem[] = [
    { route: '/(app)/dashboard', label: 'Home', icon: <NavIcon name="home" color={colors.foreground} /> },
    { route: '/(app)/devices', label: 'Devices', icon: <NavIcon name="smartphone" color={colors.foreground} /> },
    { route: '/(app)/apps', label: 'Apps', icon: <NavIcon name="grid" color={colors.foreground} /> },
    { route: '/(app)/logs', label: 'Logs', icon: <NavIcon name="terminal" color={colors.foreground} /> },
    { route: '/(app)/location', label: 'Location', icon: <NavIcon name="map-pin" color={colors.foreground} /> },
    { route: '/(app)/screenshot', label: 'Screen', icon: <NavIcon name="camera" color={colors.foreground} /> },
    { route: '/(app)/deeplinks', label: 'Links', icon: <NavIcon name="link" color={colors.foreground} /> },
    { route: '/(app)/push', label: 'Push', icon: <NavIcon name="bell" color={colors.foreground} /> },
    { route: '/(app)/files', label: 'Files', icon: <NavIcon name="folder" color={colors.foreground} /> },
    { route: '/(app)/database', label: 'DB', icon: <NavIcon name="database" color={colors.foreground} /> },
    { route: '/(app)/device-settings', label: 'Settings', icon: <NavIcon name="sliders" color={colors.foreground} /> },
    { route: '/(app)/crashes', label: 'Crashes', icon: <NavIcon name="alert-triangle" color={colors.foreground} /> },
    { route: '/(app)/media', label: 'Media', icon: <NavIcon name="image" color={colors.foreground} /> },
    { route: '/(app)/clipboard', label: 'Clip', icon: <NavIcon name="clipboard" color={colors.foreground} /> },
    { route: '/(app)/collections', label: 'Flows', icon: <NavIcon name="layers" color={colors.foreground} /> },
    { route: '/(app)/tool-settings', label: 'Config', icon: <NavIcon name="settings" color={colors.foreground} /> },
  ];

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
      <View style={styles.logoWrap}>
        <MaterialCommunityIcons name="devices" size={22} color={colors.primary} />
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: botPad + 8 }}>
        {items.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={[
                styles.navItem,
                isActive && { backgroundColor: colors.primary + '22' },
                { borderRadius: colors.radius - 2 },
              ]}
              activeOpacity={0.7}
            >
              {React.cloneElement(item.icon as React.ReactElement<{ color: string }>, {
                color: isActive ? colors.primary : colors.mutedForeground,
              })}
              <Text style={[styles.label, { color: isActive ? colors.primary : colors.mutedForeground }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { width: 68, borderRightWidth: 1, alignItems: 'center' },
  logoWrap: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10, marginHorizontal: 5, marginVertical: 2, gap: 3 },
  label: { fontSize: 8.5, fontFamily: 'Inter_500Medium', letterSpacing: 0.3, textAlign: 'center' },
});
