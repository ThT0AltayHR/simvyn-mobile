import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { Feather } from '@expo/vector-icons';

const QUICK_PRESETS = ['http://localhost:3001', 'http://192.168.1.100:3001', 'http://10.0.0.2:3001'];

export default function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { serverUrl, setServerUrl, testConnection, isConnected, isConnecting, connectionError } = useSimvyn();
  const [inputUrl, setInputUrl] = useState(serverUrl || 'http://');
  const [tested, setTested] = useState(false);

  useEffect(() => {
    if (isConnected && serverUrl) {
      router.replace('/(app)/dashboard');
    }
  }, [isConnected, serverUrl]);

  const handleConnect = async () => {
    if (!inputUrl.startsWith('http')) return;
    await setServerUrl(inputUrl);
    const ok = await testConnection(inputUrl.replace(/\/$/, ''));
    setTested(true);
    if (ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)/dashboard');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: topPad + 40, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image source={require('../assets/images/icon.png')} style={styles.icon} />
            <Text style={[styles.appName, { color: colors.foreground }]}>simvyn</Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Mobile Device Control</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>SIMVYN SERVER URL</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: colors.radius - 2 }]}>
              <Feather name="server" size={15} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="http://192.168.1.x:3001"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={handleConnect}
              />
            </View>

            {/* Quick presets */}
            <View style={styles.presets}>
              {QUICK_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setInputUrl(p)}
                  style={[styles.preset, { backgroundColor: colors.elevated, borderRadius: 6, borderColor: colors.border }]}
                >
                  <Text style={[styles.presetText, { color: colors.mutedForeground }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Error */}
            {tested && connectionError && (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + '22', borderRadius: 8 }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{connectionError}</Text>
              </View>
            )}

            {/* Connect button */}
            <TouchableOpacity
              onPress={handleConnect}
              disabled={isConnecting}
              style={[styles.connectBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 2, opacity: isConnecting ? 0.7 : 1 }]}
            >
              {isConnecting ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <>
                  <Feather name="zap" size={15} color={colors.primaryForeground} />
                  <Text style={[styles.connectText, { color: colors.primaryForeground }]}>Connect</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            AltayHR Developer · turkhackteam.org
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  container: { alignItems: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32, gap: 6 },
  icon: { width: 72, height: 72, borderRadius: 18 },
  appName: { fontSize: 32, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  tagline: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  card: { width: '100%', maxWidth: 440, borderWidth: 1, padding: 20, gap: 14 },
  label: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', padding: 0 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  preset: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  presetText: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  errorText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  connectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  connectText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  footer: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 32 },
});
