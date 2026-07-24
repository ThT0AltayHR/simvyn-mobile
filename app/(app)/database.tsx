import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';

export default function DatabaseScreen() {
  const colors = useColors();
  const { selectedDevice } = useSimvyn();
  const { get } = useApi();
  const [bundleId, setBundleId] = useState('');
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM sqlite_master WHERE type="table"');
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [querying, setQuerying] = useState(false);

  const loadDatabases = async () => {
    if (!selectedDevice || !bundleId) return;
    setLoading(true);
    try {
      const data = await get(`/database/list/${selectedDevice.id}/${encodeURIComponent(bundleId)}`);
      setDatabases(Array.isArray(data) ? data : data.databases ?? []);
    } catch (e: any) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  const runQuery = async () => {
    if (!selectedDevice || !bundleId || !selectedDb || !sqlQuery) return;
    setQuerying(true);
    try {
      const data = await get(`/database/query/${selectedDevice.id}/${encodeURIComponent(bundleId)}?db=${encodeURIComponent(selectedDb)}&sql=${encodeURIComponent(sqlQuery)}`);
      const rows = Array.isArray(data) ? data : data.rows ?? [];
      setResults(rows);
      if (rows.length > 0) setColumns(Object.keys(rows[0]));
    } catch (e: any) { Alert.alert('Query Error', e.message); }
    setQuerying(false);
  };

  if (!selectedDevice) return <EmptyState icon="database" title="No Device Selected" subtitle="Select a booted device to inspect databases." />;

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }]}>
      <ScrollView horizontal={false} style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <SectionHeader title="App Bundle" />
        <GlassCard style={{ marginBottom: 14 }}>
          <View style={[styles.inputRow, { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}>
            <Feather name="package" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={bundleId}
              onChangeText={setBundleId}
              placeholder="com.example.app"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={loadDatabases}
            />
            <TouchableOpacity onPress={loadDatabases} style={[styles.searchBtn, { backgroundColor: colors.primary, borderRadius: 7 }]}>
              <Feather name="search" size={13} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {loading && <LoadingState label="Loading databases..." />}
        {databases.length > 0 && (
          <>
            <SectionHeader title="Databases" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {databases.map((db) => (
                <TouchableOpacity
                  key={db}
                  onPress={() => setSelectedDb(db)}
                  style={[styles.dbChip, {
                    backgroundColor: selectedDb === db ? colors.primary + '22' : colors.card,
                    borderColor: selectedDb === db ? colors.primary : colors.border,
                    borderRadius: 8,
                  }]}
                >
                  <Feather name="database" size={12} color={selectedDb === db ? colors.primary : colors.mutedForeground} />
                  <Text style={[styles.dbChipText, { color: selectedDb === db ? colors.primary : colors.foreground }]}>{db}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {selectedDb && (
          <>
            <SectionHeader title="SQL Query" />
            <GlassCard style={{ marginBottom: 14 }}>
              <TextInput
                style={[styles.sqlInput, { color: colors.foreground, backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: 8 }]}
                value={sqlQuery}
                onChangeText={setSqlQuery}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
              <TouchableOpacity
                onPress={runQuery}
                disabled={querying}
                style={[styles.runBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              >
                <Feather name="play" size={14} color={colors.primaryForeground} />
                <Text style={[styles.runBtnText, { color: colors.primaryForeground }]}>{querying ? 'Running...' : 'Run Query'}</Text>
              </TouchableOpacity>
            </GlassCard>
          </>
        )}

        {results.length > 0 && (
          <>
            <SectionHeader title={`Results (${results.length} rows)`} />
            <ScrollView horizontal showsHorizontalScrollIndicator style={styles.tableContainer}>
              <View>
                {/* Header */}
                <View style={[styles.tableRow, { backgroundColor: colors.elevated }]}>
                  {columns.map((col) => (
                    <Text key={col} style={[styles.tableHeader, { color: colors.primary, borderColor: colors.border }]}>{col}</Text>
                  ))}
                </View>
                {/* Rows */}
                {results.map((row, idx) => (
                  <View key={idx} style={[styles.tableRow, { backgroundColor: idx % 2 === 0 ? colors.card : colors.surface }]}>
                    {columns.map((col) => (
                      <Text key={col} style={[styles.tableCell, { color: colors.foreground, borderColor: colors.border }]} numberOfLines={2}>
                        {String(row[col] ?? '')}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1 },
  input: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', padding: 0 },
  searchBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  dbChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  dbChipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  sqlInput: { fontSize: 12, fontFamily: 'Inter_400Regular', padding: 10, borderWidth: 1, minHeight: 80, marginBottom: 10 },
  runBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11 },
  runBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  tableContainer: { maxHeight: 300 },
  tableRow: { flexDirection: 'row' },
  tableHeader: { minWidth: 100, padding: 8, fontSize: 11, fontFamily: 'Inter_600SemiBold', borderRightWidth: 1, borderBottomWidth: 1 },
  tableCell: { minWidth: 100, padding: 8, fontSize: 11, fontFamily: 'Inter_400Regular', borderRightWidth: 1, borderBottomWidth: 1 },
});
