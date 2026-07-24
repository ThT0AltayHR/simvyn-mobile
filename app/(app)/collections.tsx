import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApi } from '@/hooks/useApi';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import type { Collection } from '@/types';

export default function CollectionsScreen() {
  const colors = useColors();
  const { get, post, del } = useApi();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get('/collections/');
      setCollections(Array.isArray(data) ? data : data.collections ?? []);
    } catch (_) { setCollections([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createCollection = async () => {
    if (!newName) return;
    setCreating(true);
    try {
      await post('/collections/', { name: newName, steps: [] });
      await load();
      setShowCreate(false);
      setNewName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setCreating(false);
  };

  const deleteCollection = async (id: string) => {
    Alert.alert('Delete', 'Delete this collection?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await del(`/collections/${id}`);
          setCollections((prev) => prev.filter((c) => c.id !== id));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const runCollection = async (id: string) => {
    try {
      await post('/collections/run', { collectionId: id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Running', 'Collection started.');
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingState label="Loading collections..." />;

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Collections</Text>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          style={[styles.createBtn, { backgroundColor: colors.primary + '22', borderColor: colors.primary, borderRadius: 8 }]}
        >
          <Feather name="plus" size={14} color={colors.primary} />
          <Text style={[{ color: colors.primary, fontSize: 12, fontFamily: 'Inter_500Medium' }]}>New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={collections}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        scrollEnabled={!!collections.length}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <GlassCard>
            <View style={styles.collectionHeader}>
              <View style={[styles.collIcon, { backgroundColor: colors.accent + '22', borderRadius: 10 }]}>
                <Feather name="layers" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.collName, { color: colors.foreground }]}>{item.name}</Text>
                <Text style={[styles.collMeta, { color: colors.mutedForeground }]}>
                  {item.steps?.length ?? 0} steps · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => runCollection(item.id)}
                style={[styles.runBtn, { backgroundColor: colors.primary, borderRadius: 8 }]}
              >
                <Feather name="play" size={14} color={colors.primaryForeground} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteCollection(item.id)}
                style={[styles.runBtn, { backgroundColor: colors.destructive + '22', borderRadius: 8 }]}
              >
                <Feather name="trash-2" size={14} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={<EmptyState icon="layers" title="No Collections" subtitle="Create a collection to bundle device actions." />}
      />

      <Modal visible={showCreate} transparent animationType="fade" onRequestClose={() => setShowCreate(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setShowCreate(false)} activeOpacity={1}>
          <View style={[styles.createModal, { backgroundColor: colors.elevated, borderRadius: 14, borderColor: colors.border }]}>
            <Text style={[styles.createTitle, { color: colors.foreground }]}>New Collection</Text>
            <TextInput
              style={[styles.createInput, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8 }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Collection name..."
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />
            <TouchableOpacity
              onPress={createCollection}
              disabled={creating || !newName}
              style={[styles.createSubmit, { backgroundColor: colors.primary, borderRadius: 8, opacity: !newName ? 0.5 : 1 }]}
            >
              <Text style={[{ color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold', fontSize: 14 }]}>
                {creating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  collectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  collIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  collName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  collMeta: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  runBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  createModal: { width: 300, padding: 20, gap: 14, borderWidth: 1 },
  createTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  createInput: { fontSize: 14, fontFamily: 'Inter_400Regular', padding: 12, borderWidth: 1 },
  createSubmit: { paddingVertical: 12, alignItems: 'center' },
});
