import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Users, CheckCircle, XCircle, Trash2, Plus, X } from 'lucide-react-native';
import api from '../api/api';

const DriversScreen = () => {
  const { userId } = useContext(AuthContext);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState('');

  const fetchDrivers = async () => {
    try {
      const res = await api.get(`/drivers?ownerId=${userId}`);
      setDrivers(res.data);
    } catch (err) {
      console.log('Error fetching drivers', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDrivers();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async () => {
    if (!newDriverName) {
      Alert.alert('Hata', 'Lütfen sürücü adını girin.');
      return;
    }
    try {
      await api.post('/drivers', {
        name: newDriverName,
        vehicle: newDriverVehicle || 'Atanmadı',
        status: 'active',
        ownerId: userId
      });
      setModalVisible(false);
      setNewDriverName('');
      setNewDriverVehicle('');
      fetchDrivers();
      Alert.alert('Başarılı', 'Sürücü eklendi.');
    } catch (err) {
      Alert.alert('Hata', 'Sürücü eklenemedi.');
    }
  };

  const handleDeleteDriver = (id) => {
    Alert.alert('Onay', 'Bu sürücüyü silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/drivers/${id}`);
          fetchDrivers();
        } catch (err) {
          Alert.alert('Hata', 'Silme işlemi başarısız.');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Users color="#00d4ff" size={24} />
          <Text style={styles.nameText}>{item.name}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.statusBadge}>
            {item.status === 'active' ? (
              <CheckCircle color="#10b981" size={16} />
            ) : (
              <XCircle color="#ef4444" size={16} />
            )}
          </View>
          <TouchableOpacity onPress={() => handleDeleteDriver(item._id)} style={styles.deleteBtn}>
            <Trash2 color="#ef4444" size={18} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.vehicleText}>Atanan Araç: {item.vehicle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SÜRÜCÜLERİM</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#00d4ff" />
        </View>
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item._id || item.name}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz kayıtlı sürücünüz bulunmuyor.</Text>
          }
        />
      )}

      {/* FAB - Ekle Butonu */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="#000" size={24} />
      </TouchableOpacity>

      {/* Sürücü Ekleme Modalı */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Sürücü Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#a0a0b0" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Sürücü Adı Soyadı *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Ali Kaya"
                placeholderTextColor="#666"
                value={newDriverName}
                onChangeText={setNewDriverName}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Araç</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Ford Transit (Opsiyonel)"
                placeholderTextColor="#666"
                value={newDriverVehicle}
                onChangeText={setNewDriverVehicle}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddDriver}>
              <Text style={styles.saveBtnText}>KAYDET</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e17' },
  header: {
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#121826',
    borderBottomWidth: 1, borderBottomColor: '#1f2937', alignItems: 'center'
  },
  headerTitle: { color: '#00d4ff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 80 },
  card: {
    backgroundColor: '#121826', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#1f2937'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  nameContainer: { flexDirection: 'row', alignItems: 'center' },
  nameText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 20, marginRight: 8 },
  deleteBtn: { padding: 6 },
  cardBody: { paddingLeft: 36 },
  vehicleText: { color: '#a0a0b0', fontSize: 14 },
  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute', right: 20, bottom: 20, backgroundColor: '#00d4ff',
    width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#00d4ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: '#121826', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1, borderTopColor: '#1f2937'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  formGroup: { marginBottom: 16 },
  label: { color: '#a0a0b0', fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: '#0a0e17', borderRadius: 8, borderWidth: 1, borderColor: '#1f2937',
    color: '#fff', padding: 12, fontSize: 16
  },
  saveBtn: {
    backgroundColor: '#00d4ff', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8
  },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});

export default DriversScreen;
