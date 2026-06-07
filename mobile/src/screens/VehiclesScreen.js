import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Truck, Trash2, Plus, X } from 'lucide-react-native';
import api from '../api/api';

const VehiclesScreen = () => {
  const { userId } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('');

  const fetchVehicles = async () => {
    try {
      const res = await api.get(`/vehicles?ownerId=${userId}`);
      setVehicles(res.data);
    } catch (err) {
      console.log('Error fetching vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVehicles();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    if (!newPlate || !newModel || !newYear) {
      Alert.alert('Hata', 'Lütfen plaka, model ve yıl bilgilerini girin.');
      return;
    }
    try {
      await api.post('/vehicles', {
        plate: newPlate,
        model: newModel,
        year: parseInt(newYear, 10),
        status: 'Aktif',
        ownerId: userId
      });
      setModalVisible(false);
      setNewPlate('');
      setNewModel('');
      setNewYear('');
      fetchVehicles();
      Alert.alert('Başarılı', 'Araç eklendi.');
    } catch (err) {
      Alert.alert('Hata', 'Araç eklenemedi.');
    }
  };

  const handleDeleteVehicle = (id) => {
    Alert.alert('Onay', 'Bu aracı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/vehicles/${id}`);
          fetchVehicles();
        } catch (err) {
          Alert.alert('Hata', 'Silme işlemi başarısız.');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Truck color="#00d4ff" size={24} />
          <Text style={styles.plateText}>{item.plate}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteVehicle(item._id)} style={styles.deleteBtn}>
          <Trash2 color="#ef4444" size={18} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.modelText}>{item.model} ({item.year})</Text>
        <Text style={styles.driverText}>Sürücü: {item.driverName}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ARAÇLARIM</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#00d4ff" />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item._id || item.plate}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz kayıtlı aracınız bulunmuyor.</Text>
          }
        />
      )}

      {/* FAB - Ekle Butonu */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="#000" size={24} />
      </TouchableOpacity>

      {/* Araç Ekleme Modalı */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Araç Ekle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#a0a0b0" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Araç Plakası *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 34 ABC 123"
                placeholderTextColor="#666"
                value={newPlate}
                onChangeText={setNewPlate}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Araç Modeli *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Ford Transit"
                placeholderTextColor="#666"
                value={newModel}
                onChangeText={setNewModel}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Yıl *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 2023"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={newYear}
                onChangeText={setNewYear}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddVehicle}>
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
  titleContainer: { flexDirection: 'row', alignItems: 'center' },
  plateText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12, letterSpacing: 2 },
  deleteBtn: { padding: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 },
  cardBody: { paddingLeft: 36 },
  modelText: { color: '#a0a0b0', fontSize: 14, marginBottom: 4 },
  driverText: { color: '#00d4ff', fontSize: 14, fontWeight: '500' },
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

export default VehiclesScreen;
