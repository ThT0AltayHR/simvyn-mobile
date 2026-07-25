import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useSimvyn } from '@/context/SimvynContext';
import { useApi } from '@/hooks/useApi';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';

// ─── Guide Data ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS = [
  {
    icon: 'zap',
    title: 'Hızlı Başlangıç',
    items: [
      {
        step: '1',
        title: 'Sunucuyu Başlat',
        desc: 'Bilgisayarında terminali aç ve şu komutu çalıştır:\n\nnpx simvyn\n\nSimvyn server başlayacak ve IP:PORT gösterecek (örn. 192.168.1.10:3001).',
      },
      {
        step: '2',
        title: 'Aynı Wi-Fi\'ye Bağlan',
        desc: 'Telefon ve bilgisayar AYNI Wi-Fi ağında olmalı. Hotspot üzerinden de çalışır: telefondan hotspot aç, bilgisayarı ona bağla.',
      },
      {
        step: '3',
        title: 'Sunucu URL\'sini Gir',
        desc: 'Bağlantı ekranında:\nhttp://192.168.1.10:3001\nformatta gir. "Connect" butonuna bas.',
      },
      {
        step: '4',
        title: 'Cihazını Seç',
        desc: 'Bağlantı sağlandıktan sonra üst çubuktan cihazını seç. Tüm modüller seçili cihaz üzerinde çalışır.',
      },
    ],
  },
  {
    icon: 'smartphone',
    title: 'Cihaz Yönetimi',
    items: [
      {
        step: '→',
        title: 'iOS Simulator Boot',
        desc: 'Xcode Simulator listesi otomatik gelir. "Boot" ile başlat, "Shutdown" ile kapat. "Erase" seçeneği cihazı fabrika ayarlarına döndürür.',
      },
      {
        step: '→',
        title: 'Android Emülatör',
        desc: 'Android Studio\'da AVD oluşturulmuş emülatörler listelenir. Aynı şekilde boot/shutdown/wipe işlemleri yapılabilir.',
      },
      {
        step: '→',
        title: 'Gerçek Cihaz',
        desc: 'USB ile bağlı gerçek iOS/Android cihazlar da listede görünür ve desteklenen işlemler uygulanabilir.',
      },
    ],
  },
  {
    icon: 'grid',
    title: 'Modüller',
    items: [
      {
        step: '📱',
        title: 'Apps — Uygulama Yönetimi',
        desc: 'Cihazda yüklü uygulamaları listeler. Seçili uygulamayı launch, terminate, uninstall veya clear data yapabilirsin.',
      },
      {
        step: '📋',
        title: 'Logs — Canlı Log Akışı',
        desc: 'Seçili cihazın log akışını WebSocket üzerinden gerçek zamanlı gösterir. Level (debug/info/warn/error) filtresi ve regex arama desteklenir.',
      },
      {
        step: '📍',
        title: 'Location — GPS Simülasyonu',
        desc: 'iOS Simulator ve Android Emülatör\'de sahte GPS konumu ayarla. Koordinat gir veya hazır şehir önayarlarını kullan.',
      },
      {
        step: '📸',
        title: 'Screenshot — Ekran Görüntüsü',
        desc: 'Anlık ekran görüntüsü al, indir veya paylaş. Ekran kaydı da başlatılabilir.',
      },
      {
        step: '🔗',
        title: 'Deep Links — URL Aç',
        desc: 'Simülatörde deep link veya URL scheme aç. Bundle ID hedefleyerek belirli uygulamayı tetikleyebilirsin.',
      },
      {
        step: '🔔',
        title: 'Push — Bildirim Gönder',
        desc: 'iOS Simulator\'a APNs payload gönder. JSON editörü ile özelleştir veya hazır şablonları kullan.',
      },
      {
        step: '📁',
        title: 'Files — Dosya Gezgini',
        desc: 'Uygulama sandbox dosya sistemi. Breadcrumb navigasyonla klasör gez, dosya adlarını gör.',
      },
      {
        step: '🗄️',
        title: 'Database — SQLite Gezgini',
        desc: 'Uygulama SQLite veritabanlarını listeler. Tablo görünümü ve özel SQL sorgusu çalıştırma desteklenir.',
      },
      {
        step: '⚙️',
        title: 'Device Settings — Cihaz Ayarları',
        desc: 'Cihazda dark mode, ekran yönü, locale (dil/bölge), durum çubuğu ve erişilebilirlik ayarlarını değiştir.',
      },
      {
        step: '💥',
        title: 'Crashes — Çökme Logları',
        desc: 'iOS ve Android çökme raporlarını listeler. Detay görünümünde stack trace\'i okuyabilirsin.',
      },
      {
        step: '🖼️',
        title: 'Media — Medya Aktar',
        desc: 'Telefonundan foto/video seç ve cihazın galerisine aktar. Gerçek dosya transferi — simülasyon değil.',
      },
      {
        step: '📋',
        title: 'Clipboard — Pano',
        desc: 'Cihazın panosunu oku veya yaz. Metin verisi gerçek zamanlı aktarılır.',
      },
      {
        step: '📦',
        title: 'Collections — Aksiyon Koleksiyonları',
        desc: 'Sık kullandığın işlemleri (URL aç + screenshot + log temizle gibi) grupla ve tek tuşla çalıştır.',
      },
    ],
  },
  {
    icon: 'wifi-off',
    title: 'Bağlantı Sorunları',
    items: [
      {
        step: '!',
        title: 'Bağlanamıyorum',
        desc: '• Bilgisayar ve telefon aynı ağda mı?\n• "npx simvyn" çalışıyor mu?\n• Firewall/güvenlik duvarı 3001 portunu engelliyor olabilir — kapatıp tekrar dene.\n• URL başında "http://" var mı?',
      },
      {
        step: '!',
        title: 'WebSocket bağlanmıyor',
        desc: 'WS bağlantısı log akışı ve canlı cihaz güncellemeleri için gerekli. Sunucu çalışıyorsa otomatik yeniden bağlanır. Sarı gösterge = WS yok, yeşil = tamam.',
      },
      {
        step: '!',
        title: 'Cihaz listesi boş',
        desc: '• iOS: Xcode Simulator kurulu mu?\n• Android: Android Studio + AVD kurulu mu?\n• Emülatörü/simülatörü önce bilgisayardan başlat, sonra Simvyn\'e bak.',
      },
    ],
  },
  {
    icon: 'info',
    title: 'Hakkında',
    items: [
      {
        step: '★',
        title: 'Simvyn Mobile v1.0.0',
        desc: 'Simvyn açık kaynak projesinin (github.com/pranshuchittora/simvyn) Expo/React Native mobil portu.\n\nGeliştirici: AltayHR Developer\nWeb: turkhackteam.org\n\nBu uygulama bir uzaktan kontrol paneli olarak çalışır. Tüm işlemler Simvyn server üzerinden gerçek cihaz/simülatör API\'lerine gider — simülasyon veya mock içermez.',
      },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ToolSettingsScreen() {
  const colors = useColors();
  const { serverUrl, setServerUrl, isConnected, wsConnected, devices } = useSimvyn();
  const { get, del } = useApi();
  const [editUrl, setEditUrl] = useState(serverUrl);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'guide'>('settings');
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const wipeData = async () => {
    Alert.alert('Wipe All Data', 'This will delete all stored data from the Simvyn server. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Wipe', style: 'destructive', onPress: async () => {
          try {
            await del('/api/tool-settings/data');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Done', 'All server data wiped.');
          } catch (e: any) { Alert.alert('Error', e.message); }
        }
      },
    ]);
  };

  const disconnect = async () => {
    await AsyncStorage.removeItem('@simvyn/server_url');
    await setServerUrl('');
    router.replace('/');
  };

  const saveUrl = async () => {
    await setServerUrl(editUrl);
    setEditMode(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const s = StyleSheet.create({
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    tabText: { fontSize: 13, fontWeight: '600' },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    label: { flex: 1, fontSize: 13, color: colors.mutedForeground },
    value: { fontSize: 13, fontWeight: '600', color: colors.foreground },
    btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 10 },
    btnText: { fontSize: 14, fontWeight: '600' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
    sectionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
    sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.foreground },
    itemBtn: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    stepBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
    stepText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    itemTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.foreground },
    itemDesc: { fontSize: 12, lineHeight: 18, color: colors.mutedForeground, marginTop: 6, marginLeft: 32, paddingRight: 4 },
  });

  const renderSettings = () => (
    <>
      <SectionHeader title="Connection" />
      <GlassCard style={{ marginBottom: 14 }}>
        <View style={s.row}>
          <View style={[s.dot, { backgroundColor: isConnected ? colors.statusBooted : colors.destructive }]} />
          <Text style={s.label}>Status</Text>
          <Text style={s.value}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.row}>
          <View style={[s.dot, { backgroundColor: wsConnected ? colors.statusBooted : colors.mutedForeground }]} />
          <Text style={s.label}>WebSocket</Text>
          <Text style={s.value}>{wsConnected ? 'Live' : 'Offline'}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.row}>
          <Feather name="server" size={14} color={colors.mutedForeground} />
          <Text style={s.label}>Devices</Text>
          <Text style={s.value}>{devices.length} found</Text>
        </View>
      </GlassCard>

      <SectionHeader title="Server URL" />
      <GlassCard style={{ marginBottom: 14 }}>
        {editMode ? (
          <>
            <TextInput
              style={{ color: colors.foreground, fontSize: 14, padding: 8, backgroundColor: colors.input, borderRadius: 8, marginBottom: 10 }}
              value={editUrl}
              onChangeText={setEditUrl}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="http://192.168.1.x:3001"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={saveUrl}
                style={[s.btn, { flex: 1, backgroundColor: colors.primary, marginBottom: 0 }]}>
                <Feather name="check" size={14} color={colors.primaryForeground} />
                <Text style={[s.btnText, { color: colors.primaryForeground }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setEditMode(false); setEditUrl(serverUrl); }}
                style={[s.btn, { flex: 1, backgroundColor: colors.secondary, marginBottom: 0 }]}>
                <Text style={[s.btnText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity onPress={() => setEditMode(true)} style={s.row}>
            <Feather name="link" size={14} color={colors.mutedForeground} />
            <Text style={[s.label, { flex: 1 }]}>{serverUrl || '—'}</Text>
            <Feather name="edit-2" size={13} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </GlassCard>

      <SectionHeader title="Danger Zone" />
      <GlassCard style={{ marginBottom: 14 }}>
        <TouchableOpacity onPress={wipeData} style={[s.btn, { backgroundColor: colors.destructive + '22', marginBottom: 0, marginTop: 0 }]}>
          <Feather name="trash-2" size={15} color={colors.destructive} />
          <Text style={[s.btnText, { color: colors.destructive }]}>Wipe Server Data</Text>
        </TouchableOpacity>
        <View style={s.divider} />
        <TouchableOpacity onPress={disconnect} style={[s.btn, { backgroundColor: colors.secondary, marginBottom: 0 }]}>
          <Feather name="log-out" size={15} color={colors.foreground} />
          <Text style={[s.btnText, { color: colors.foreground }]}>Disconnect & Reset</Text>
        </TouchableOpacity>
      </GlassCard>

      <SectionHeader title="About" />
      <GlassCard>
        <View style={s.row}>
          <Feather name="code" size={14} color={colors.mutedForeground} />
          <Text style={s.label}>Developer</Text>
          <Text style={s.value}>AltayHR Developer</Text>
        </View>
        <View style={s.divider} />
        <TouchableOpacity style={s.row} onPress={() => Linking.openURL('https://turkhackteam.org')}>
          <Feather name="globe" size={14} color={colors.mutedForeground} />
          <Text style={s.label}>Website</Text>
          <Text style={[s.value, { color: colors.primary }]}>turkhackteam.org</Text>
        </TouchableOpacity>
        <View style={s.divider} />
        <View style={s.row}>
          <Feather name="package" size={14} color={colors.mutedForeground} />
          <Text style={s.label}>Version</Text>
          <Text style={s.value}>1.0.0</Text>
        </View>
      </GlassCard>
    </>
  );

  const renderGuide = () => (
    <>
      {GUIDE_SECTIONS.map((section, si) => (
        <GlassCard key={si} style={{ marginBottom: 10 }}>
          <TouchableOpacity
            style={s.sectionBtn}
            onPress={() => {
              setExpandedSection(expandedSection === si ? null : si);
              Haptics.selectionAsync();
            }}>
            <Feather name={section.icon as any} size={16} color={colors.primary} />
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Feather
              name={expandedSection === si ? 'chevron-up' : 'chevron-down'}
              size={15}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
          {expandedSection === si && section.items.map((item, ii) => {
            const key = `${si}-${ii}`;
            const open = expandedItem === key;
            return (
              <TouchableOpacity
                key={ii}
                style={[s.itemBtn, ii === section.items.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => { setExpandedItem(open ? null : key); Haptics.selectionAsync(); }}>
                <View style={s.itemHeader}>
                  <View style={s.stepBadge}>
                    <Text style={s.stepText}>{item.step}</Text>
                  </View>
                  <Text style={s.itemTitle}>{item.title}</Text>
                  <Feather name={open ? 'chevron-up' : 'chevron-right'} size={13} color={colors.mutedForeground} />
                </View>
                {open && <Text style={s.itemDesc}>{item.desc}</Text>}
              </TouchableOpacity>
            );
          })}
        </GlassCard>
      ))}
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Tab Bar */}
      <View style={{ flexDirection: 'row', gap: 6, padding: 12, paddingBottom: 4 }}>
        <TouchableOpacity
          style={[s.tab, { backgroundColor: activeTab === 'settings' ? colors.primary : colors.surface }]}
          onPress={() => setActiveTab('settings')}>
          <Text style={[s.tabText, { color: activeTab === 'settings' ? colors.primaryForeground : colors.mutedForeground }]}>
            ⚙ Ayarlar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, { backgroundColor: activeTab === 'guide' ? colors.primary : colors.surface }]}
          onPress={() => setActiveTab('guide')}>
          <Text style={[s.tabText, { color: activeTab === 'guide' ? colors.primaryForeground : colors.mutedForeground }]}>
            📖 Kullanım Kılavuzu
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
        {activeTab === 'settings' ? renderSettings() : renderGuide()}
      </ScrollView>
    </View>
  );
}
