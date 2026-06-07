import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ShieldAlert, Zap, AlertTriangle, AlertOctagon, Car, Activity, ShieldCheck, ChevronLeft } from 'lucide-react-native';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const MESSAGE_TEMPLATES = [
  { id: 1, title: 'Hatalı Sollama', category: 'danger' },
  { id: 2, title: 'Kırmızı Işık İhlali', category: 'danger' },
  { id: 3, title: 'Aşırı Hız', category: 'danger' },
  { id: 4, title: 'Yanlış Park Etmişsiniz', category: 'warning' },
  { id: 5, title: 'Lastik Problemi', category: 'info' },
  { id: 6, title: 'Farlarınız Açık Kalmış', category: 'info' },
];

const ReportScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = useContext(AuthContext);
  const targetData = route.params?.targetData || 'Bilinmeyen Araç';
  
  const [loading, setLoading] = useState(false);

  const sendReport = async (template) => {
    setLoading(true);
    try {
      await api.post('/vehicles/message', {
        driverId: targetData,
        text: template.title,
        date: new Date().toLocaleString('tr-TR')
      });
      
      Alert.alert('Başarılı', 'Sürücüye uyarı başarıyla iletildi!', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Hata', 'Bildirim gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#00d4ff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İHLAL BİLDİR</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.targetInfo}>
          <ShieldAlert color="#ff4b4b" size={40} />
          <Text style={styles.targetText}>Taranan Araç:</Text>
          <Text style={styles.targetData}>{targetData}</Text>
          <Text style={styles.subtitle}>Lütfen tespit ettiğiniz ihlali seçin. Bu bildirim anında merkeze ve sürücüye iletilecektir.</Text>
        </View>

        <View style={styles.templatesContainer}>
          {MESSAGE_TEMPLATES.map((tpl) => (
            <TouchableOpacity 
              key={tpl.id} 
              style={[
                styles.templateBtn, 
                tpl.category === 'danger' ? styles.dangerBorder : 
                tpl.category === 'warning' ? styles.warningBorder : styles.infoBorder
              ]}
              onPress={() => sendReport(tpl)}
              disabled={loading}
            >
              {tpl.category === 'danger' && <AlertOctagon color="#ff4b4b" size={24} />}
              {tpl.category === 'warning' && <AlertTriangle color="#f59e0b" size={24} />}
              {tpl.category === 'info' && <ShieldCheck color="#3b82f6" size={24} />}
              
              <Text style={styles.templateText}>{tpl.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#00d4ff" />
            <Text style={styles.loaderText}>Gönderiliyor...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e17' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#121826',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#ff4b4b', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  content: { padding: 20 },
  targetInfo: { alignItems: 'center', marginBottom: 30, backgroundColor: '#121826', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' },
  targetText: { color: '#a0a0b0', fontSize: 14, marginTop: 12 },
  targetData: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginVertical: 8, textAlign: 'center' },
  subtitle: { color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 8 },
  templatesContainer: { gap: 12 },
  templateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121826', padding: 16, borderRadius: 12, borderWidth: 1 },
  dangerBorder: { borderColor: 'rgba(255, 75, 75, 0.3)' },
  warningBorder: { borderColor: 'rgba(245, 158, 11, 0.3)' },
  infoBorder: { borderColor: 'rgba(59, 130, 246, 0.3)' },
  templateText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 16 },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 14, 23, 0.8)', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  loaderText: { color: '#00d4ff', marginTop: 12, fontWeight: 'bold' }
});

export default ReportScreen;
