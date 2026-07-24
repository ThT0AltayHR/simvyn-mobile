import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon = 'inbox', title, subtitle, action }: EmptyStateProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Feather name={icon} size={36} color={colors.mutedForeground} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Feather name="alert-circle" size={36} color={colors.destructive} />
      <Text style={[styles.title, { color: colors.destructive }]}>Error</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
        >
          <Text style={[styles.btnText, { color: colors.foreground }]}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function LoadingState({ label }: { label?: string }) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label && <Text style={[styles.subtitle, { color: colors.mutedForeground, marginTop: 12 }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  title: { fontSize: 16, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  btn: { paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  btnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
