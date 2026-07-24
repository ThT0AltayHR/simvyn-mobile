import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  noBorder?: boolean;
}

export function GlassCard({ children, style, padding = 14, noBorder }: GlassCardProps) {
  const colors = useColors();
  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.card,
        borderRadius: colors.radius,
        borderColor: noBorder ? 'transparent' : colors.border,
        padding,
      },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
