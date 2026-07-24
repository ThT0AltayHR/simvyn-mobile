import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export default function AppLayout() {
  const colors = useColors();
  const { isConnected, serverUrl } = useSimvyn();

  useEffect(() => {
    if (!serverUrl) {
      router.replace('/');
    }
  }, [serverUrl]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TopBar />
      <View style={styles.body}>
        <Sidebar />
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="devices" />
            <Stack.Screen name="apps" />
            <Stack.Screen name="logs" />
            <Stack.Screen name="location" />
            <Stack.Screen name="screenshot" />
            <Stack.Screen name="deeplinks" />
            <Stack.Screen name="push" />
            <Stack.Screen name="files" />
            <Stack.Screen name="database" />
            <Stack.Screen name="device-settings" />
            <Stack.Screen name="crashes" />
            <Stack.Screen name="media" />
            <Stack.Screen name="clipboard" />
            <Stack.Screen name="collections" />
            <Stack.Screen name="tool-settings" />
          </Stack>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, flexDirection: 'row' },
  content: { flex: 1 },
});
