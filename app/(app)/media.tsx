import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { SectionHeader } from '@/components/SectionHeader';

export default function MediaScreen() {
  const colors = useColors();
  const { selectedDevice, serverUrl } = useSimvyn();
  const { uploadFile } = useApi();
  const [uploading, setUploading] = useState(false);
  const [lastAdded, setLastAdded] = useState<string[]>([]);

  const pickAndUpload = async (mediaType: 'images' | 'videos') => {
    if (!selectedDevice) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'images' ? ['images'] : ['videos'],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (result.canceled) return;
    setUploading(true);
    for (const asset of result.assets) {
      try {
        const form = new FormData();
        form.append('file', {
          uri: asset.uri,
          name: asset.fileName ?? 'media',
          type: asset.mimeType ?? 'image/jpeg',
        } as unknown as Blob);
        form.append('deviceId', selectedDevice.id);
        await uploadFile('/media/add', form);
        setLastAdded((prev) => [...prev, asset.fileName ?? asset.uri]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e: any) {
        Alert.alert('Upload Error', e.message);
      }
    }
    setUploading(false);
  };

  if (!selectedDevice) return <EmptyState icon="image" title="No Device Selected" subtitle="Select a device to push media files." />;

  return (
    <ScrollView style={[{ backgroundColor: colors.background }]} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      <SectionHeader title="Push to Device Gallery" />
      <View style={{ gap: 12 }}>
        <GlassCard>
          <View style={styles.mediaOption}>
            <View style={[styles.mediaIcon, { backgroundColor: colors.primary + '22', borderRadius: 12 }]}>
              <Feather name="image" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mediaTitle, { color: colors.foreground }]}>Photos</Text>
              <Text style={[styles.mediaSub, { color: colors.mutedForeground }]}>Push images to device photo library</Text>
            </View>
            <TouchableOpacity
              onPress={() => pickAndUpload('images')}
              disabled={uploading}
              style={[styles.uploadBtn, { backgroundColor: colors.primary, borderRadius: 8 }]}
            >
              <Feather name="upload" size={14} color={colors.primaryForeground} />
              <Text style={[styles.uploadLabel, { color: colors.primaryForeground }]}>Pick</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard>
          <View style={styles.mediaOption}>
            <View style={[styles.mediaIcon, { backgroundColor: colors.accent + '22', borderRadius: 12 }]}>
              <Feather name="video" size={24} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mediaTitle, { color: colors.foreground }]}>Videos</Text>
              <Text style={[styles.mediaSub, { color: colors.mutedForeground }]}>Push videos to device media library</Text>
            </View>
            <TouchableOpacity
              onPress={() => pickAndUpload('videos')}
              disabled={uploading}
              style={[styles.uploadBtn, { backgroundColor: colors.accent, borderRadius: 8 }]}
            >
              <Feather name="upload" size={14} color={colors.primaryForeground} />
              <Text style={[styles.uploadLabel, { color: colors.primaryForeground }]}>Pick</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>

      {uploading && (
        <View style={[styles.uploadingBanner, { backgroundColor: colors.primary + '22', borderRadius: 8, marginTop: 14 }]}>
          <Feather name="upload-cloud" size={16} color={colors.primary} />
          <Text style={[styles.uploadingText, { color: colors.primary }]}>Uploading to device...</Text>
        </View>
      )}

      {lastAdded.length > 0 && (
        <>
          <SectionHeader title="Recently Added" />
          {lastAdded.map((name, i) => (
            <View key={i} style={[styles.addedRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Feather name="check-circle" size={14} color={colors.statusBooted} />
              <Text style={[styles.addedName, { color: colors.foreground }]} numberOfLines={1}>{name}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mediaOption: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mediaIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  mediaTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  mediaSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8 },
  uploadLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  uploadingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  uploadingText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  addedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, marginBottom: 6 },
  addedName: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular' },
});
