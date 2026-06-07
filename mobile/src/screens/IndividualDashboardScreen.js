import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { User, Truck, Bell, MessageSquare, LogOut, Edit3, Save, X, Phone, Mail, MapPin, QrCode, Reply, Camera } from 'lucide-react-native';
import api from '../api/api';

const IndividualDashboardScreen = ({ navigation }) => {
  const { logout, userId } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // States
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [driver, setDriver] = useState(null);
  
  const [contactEditing, setContactEditing] = useState(false);
  const [contactDraft, setContactDraft] = useState({ phone: '', email: '', address: '' });
  
  const [maintenanceEditing, setMaintenanceEditing] = useState(false);
  const [vehicleDraft, setVehicleDraft] = useState({ plate: '', model: '', year: '', km: '', lastService: '', nextService: '' });

  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${message}`);
    else Alert.alert(title, message);
  };

  const fetchData = async () => {
    try {
      const res = await api.get(`/users/me/${userId}`);
      const { user: userData, vehicle: vehicleData, driver: driverData } = res.data;
      
      setUser(userData);
      setDriver(driverData);
      
      const newContact = {
        phone: userData?.phone || 'Belirtilmedi',
        email: userData?.email || 'Belirtilmedi',
        address: 'İstanbul, Türkiye'
      };
      setContactDraft(newContact);

      if (vehicleData) {
        setVehicle(vehicleData);
        setVehicleDraft({
          plate: vehicleData.plate || '',
          model: vehicleData.model || '',
          year: vehicleData.year ? vehicleData.year.toString() : '',
          km: '45.230', // Fake for now
          lastService: vehicleData.maintenanceDate || 'Belirtilmedi',
          nextService: 'Belirtilmedi'
        });
        
        if (vehicleData.messages) {
          const msgs = vehicleData.messages.map((m) => ({
            id: m._id,
            text: m.text,
            date: m.date,
            reply: m.reply,
            replyDate: m.replyDate,
            sender: 'İhbar (Anonim)',
          }));
          setMessages(msgs.reverse());
        }
      }

      const notifRes = await api.get(`/notifications?ownerId=${userId}`);
      setNotifications(notifRes.data);

    } catch (err) {
      console.log('Error fetching individual data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSaveContact = async () => {
    try {
      await api.put(`/users/${userId}`, { phone: contactDraft.phone, email: contactDraft.email });
      setUser({ ...user, phone: contactDraft.phone, email: contactDraft.email });
      setContactEditing(false);
      showAlert('Başarılı', 'İletişim bilgileri kaydedildi.');
    } catch (error) {
      showAlert('Hata', 'Bilgiler kaydedilirken hata oluştu.');
    }
  };

  const handleSaveMaintenance = async () => {
    try {
      if (vehicle) {
        const res = await api.put(`/vehicles/${vehicle._id}`, {
          plate: vehicleDraft.plate,
          model: vehicleDraft.model,
          year: parseInt(vehicleDraft.year) || 2020,
          maintenanceDate: vehicleDraft.lastService
        });
        setVehicle(res.data);
      } else {
        // Araç yoksa Onboarding vari ekleme yapabilir (Şimdilik uyarı gösteriyoruz)
        showAlert('Hata', 'Kayıtlı aracınız bulunamadı. Lütfen sistem yöneticisiyle görüşün.');
      }
      setMaintenanceEditing(false);
      showAlert('Başarılı', 'Araç ve Bakım bilgileri kaydedildi.');
    } catch (error) {
      showAlert('Hata', 'Bilgiler kaydedilirken hata oluştu.');
    }
  };

  const handleReplyMessage = async (msgId) => {
    if (!replyText.trim()) return;
    try {
      await api.post('/vehicles/message/reply', {
        driverId: driver._id,
        messageId: msgId,
        replyText
      });
      showAlert('Başarılı', 'Yanıtınız kaydedildi.');
      setReplyingTo(null);
      setReplyText('');
      fetchData(); // Refresh messages
    } catch (error) {
      showAlert('Hata', 'Yanıt gönderilirken hata oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BİREYSEL PANEL</Text>
          <Text style={styles.headerSubtitle}>Araç Bilgileri & İletişim</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut color="#ff4b4b" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />}
        showsVerticalScrollIndicator={false}
      >
        
        {/* === QR MESAJ KUTUSU === */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.row}>
              <MessageSquare color="#00d4ff" size={20} />
              <Text style={styles.cardTitle}>QR MESAJ KUTUSU</Text>
            </View>
          </View>
          {messages.length > 0 ? (
            messages.map((m, i) => (
              <View key={i} style={styles.msgBubble}>
                <View style={styles.msgHeader}>
                  <Text style={styles.msgSender}>{m.sender}</Text>
                  <Text style={styles.msgDate}>{m.date}</Text>
                </View>
                <Text style={styles.msgText}>{m.text}</Text>
                
                {m.reply ? (
                  <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>Sizin Yanıtınız:</Text>
                    <Text style={styles.replyText}>{m.reply}</Text>
                    <Text style={styles.replyDate}>{m.replyDate}</Text>
                  </View>
                ) : replyingTo === m.id ? (
                  <View style={styles.replyInputContainer}>
                    <TextInput 
                      style={styles.replyInput} 
                      placeholder="Yanıtınızı yazın..." 
                      placeholderTextColor="#666"
                      value={replyText}
                      onChangeText={setReplyText}
                    />
                    <View style={styles.replyActionRow}>
                      <TouchableOpacity onPress={() => setReplyingTo(null)}><Text style={{color: '#ef4444', marginRight: 15}}>İptal</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.sendReplyBtn} onPress={() => handleReplyMessage(m.id)}>
                        <Text style={styles.sendReplyBtnText}>Gönder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.replyBtn} onPress={() => { setReplyingTo(m.id); setReplyText(''); }}>
                    <Reply color="#00d4ff" size={14} />
                    <Text style={styles.replyBtnText}>Yanıtla</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>QR üzerinden gelen mesajınız yok.</Text>
          )}
        </View>

        {/* === ARAÇ VE BAKIM BİLGİLERİ === */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.row}>
              <Truck color="#00d4ff" size={20} />
              <Text style={styles.cardTitle}>ARAÇ & BAKIM</Text>
            </View>
            {!maintenanceEditing ? (
              <TouchableOpacity style={styles.editBtn} onPress={() => setMaintenanceEditing(true)}>
                <Edit3 color="#00d4ff" size={16} />
                <Text style={styles.editBtnText}>Düzenle</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.row}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setMaintenanceEditing(false)}>
                  <X color="#ef4444" size={18} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={handleSaveMaintenance}>
                  <Save color="#10b981" size={18} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {!maintenanceEditing ? (
            <>
              <View style={styles.vehicleHighlight}>
                <Text style={styles.vehicleName}>{vehicle?.model || 'Araç Atanmamış'}</Text>
                <Text style={styles.vehiclePlate}>{vehicle?.plate || 'Plaka Yok'}</Text>
              </View>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}><Text style={styles.detailLabel}>Model Yılı</Text><Text style={styles.detailValue}>{vehicle?.year || '-'}</Text></View>
                <View style={styles.detailItem}><Text style={styles.detailLabel}>Kilometre</Text><Text style={styles.detailValue}>{vehicleDraft.km} km</Text></View>
                <View style={styles.detailItem}><Text style={styles.detailLabel}>Son Servis</Text><Text style={styles.detailValue}>{vehicle?.maintenanceDate || 'Belirtilmedi'}</Text></View>
                <View style={styles.detailItem}><Text style={styles.detailLabel}>Sonraki Servis</Text><Text style={[styles.detailValue, {color: '#00d4ff'}]}>{vehicleDraft.nextService}</Text></View>
              </View>
            </>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Araç Plakası</Text>
                <TextInput style={styles.input} value={vehicleDraft.plate} onChangeText={(t) => setVehicleDraft({...vehicleDraft, plate: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Marka / Model</Text>
                <TextInput style={styles.input} value={vehicleDraft.model} onChangeText={(t) => setVehicleDraft({...vehicleDraft, model: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Model Yılı</Text>
                <TextInput style={styles.input} value={vehicleDraft.year} keyboardType="numeric" onChangeText={(t) => setVehicleDraft({...vehicleDraft, year: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kilometre</Text>
                <TextInput style={styles.input} value={vehicleDraft.km} onChangeText={(t) => setVehicleDraft({...vehicleDraft, km: t})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Son Servis Tarihi</Text>
                <TextInput style={styles.input} value={vehicleDraft.lastService} onChangeText={(t) => setVehicleDraft({...vehicleDraft, lastService: t})} />
              </View>
            </View>
          )}
        </View>

        {/* === QR KOD GÖSTERİMİ === */}
        {driver && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.row}>
                <QrCode color="#00d4ff" size={20} />
                <Text style={styles.cardTitle}>QR KODUM</Text>
              </View>
            </View>
            <View style={styles.qrContainer}>
              <Image 
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DRIVER-${driver._id}` }} 
                style={styles.qrImage} 
              />
              <Text style={styles.qrText}>Bu QR kodu aracınızın camına yerleştirebilirsiniz.</Text>
            </View>
          </View>
        )}

        {/* === İLETİŞİM BİLGİLERİ === */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.row}>
              <User color="#00d4ff" size={20} />
              <Text style={styles.cardTitle}>İLETİŞİM BİLGİLERİ</Text>
            </View>
            {!contactEditing ? (
              <TouchableOpacity style={styles.editBtn} onPress={() => setContactEditing(true)}>
                <Edit3 color="#00d4ff" size={16} />
                <Text style={styles.editBtnText}>Düzenle</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.row}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setContactEditing(false)}>
                  <X color="#ef4444" size={18} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={handleSaveContact}>
                  <Save color="#10b981" size={18} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {!contactEditing ? (
            <View style={styles.contactList}>
              <View style={styles.contactRow}>
                <Phone color="#a0a0b0" size={18} /><View style={styles.contactTextWrapper}><Text style={styles.detailLabel}>Telefon</Text><Text style={styles.detailValue}>{contactDraft.phone}</Text></View>
              </View>
              <View style={styles.contactRow}>
                <Mail color="#a0a0b0" size={18} /><View style={styles.contactTextWrapper}><Text style={styles.detailLabel}>E-Posta</Text><Text style={styles.detailValue}>{contactDraft.email}</Text></View>
              </View>
              <View style={styles.contactRow}>
                <MapPin color="#a0a0b0" size={18} /><View style={styles.contactTextWrapper}><Text style={styles.detailLabel}>Adres</Text><Text style={styles.detailValue}>{contactDraft.address}</Text></View>
              </View>
            </View>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefon</Text>
                <TextInput style={styles.input} value={contactDraft.phone} onChangeText={(t) => setContactDraft({...contactDraft, phone: t})} keyboardType="phone-pad" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-Posta</Text>
                <TextInput style={styles.input} value={contactDraft.email} onChangeText={(t) => setContactDraft({...contactDraft, email: t})} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adres</Text>
                <TextInput style={styles.input} value={contactDraft.address} onChangeText={(t) => setContactDraft({...contactDraft, address: t})} />
              </View>
            </View>
          )}
        </View>


        {/* === BİLDİRİMLER === */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.row}>
              <Bell color="#00d4ff" size={20} />
              <Text style={styles.cardTitle}>SİSTEM BİLDİRİMLERİ</Text>
            </View>
          </View>
          {notifications.length > 0 ? (
            notifications.map((n, i) => (
              <View key={i} style={styles.notifItem}>
                <Text style={styles.notifMsg}>{n.message}</Text>
                <Text style={styles.notifDate}>{n.date}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Bildiriminiz yok.</Text>
          )}
        </View>

      </ScrollView>

      {/* FAB - Kayan QR Okuyucu Butonu */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('QRScanner')}
      >
        <Camera color="#000" size={28} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e17' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0e17' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    backgroundColor: '#121826', borderBottomWidth: 1, borderBottomColor: '#1f2937'
  },
  headerTitle: { color: '#00d4ff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  headerSubtitle: { color: '#a0a0b0', fontSize: 12 },
  logoutBtn: { padding: 8, backgroundColor: 'rgba(255, 75, 75, 0.1)', borderRadius: 8 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#121826', borderRadius: 12, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#1f2937'
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8, letterSpacing: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 212, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  editBtnText: { color: '#00d4ff', fontSize: 12, marginLeft: 4, fontWeight: '600' },
  iconBtn: { padding: 6, marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6 },
  vehicleHighlight: { backgroundColor: 'rgba(0, 212, 255, 0.05)', padding: 16, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  vehicleName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  vehiclePlate: { color: '#00d4ff', fontSize: 16, marginTop: 4, letterSpacing: 2 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailItem: { width: '48%', marginBottom: 16 },
  detailLabel: { color: '#a0a0b0', fontSize: 12, marginBottom: 4 },
  detailValue: { color: '#fff', fontSize: 14, fontWeight: '500' },
  contactList: { gap: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contactTextWrapper: { marginLeft: 12 },
  editForm: { gap: 12 },
  inputGroup: { marginBottom: 8 },
  inputLabel: { color: '#a0a0b0', fontSize: 12, marginBottom: 4 },
  input: { backgroundColor: '#0a0e17', borderRadius: 6, borderWidth: 1, borderColor: '#1f2937', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  notifItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  notifMsg: { color: '#fff', fontSize: 14, marginBottom: 4 },
  notifDate: { color: '#6b7280', fontSize: 11 },
  emptyText: { color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 10 },
  qrContainer: { alignItems: 'center', paddingVertical: 10 },
  qrImage: { width: 200, height: 200, borderRadius: 8, marginBottom: 12 },
  qrText: { color: '#a0a0b0', fontSize: 12, textAlign: 'center' },
  msgBubble: { backgroundColor: '#1f2937', padding: 12, borderRadius: 8, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#ef4444' },
  msgHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  msgSender: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
  msgDate: { color: '#6b7280', fontSize: 10 },
  msgText: { color: '#fff', fontSize: 14, marginBottom: 8 },
  replyBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', padding: 4 },
  replyBtnText: { color: '#00d4ff', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },
  replyInputContainer: { marginTop: 10, backgroundColor: '#0a0e17', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: '#374151' },
  replyInput: { color: '#fff', fontSize: 13, minHeight: 40 },
  replyActionRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 },
  sendReplyBtn: { backgroundColor: '#00d4ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  sendReplyBtnText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  replyBox: { marginTop: 8, backgroundColor: 'rgba(0, 212, 255, 0.05)', padding: 10, borderRadius: 6, borderLeftWidth: 2, borderLeftColor: '#00d4ff' },
  replyLabel: { color: '#00d4ff', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  replyText: { color: '#fff', fontSize: 13 },
  replyDate: { color: '#6b7280', fontSize: 10, marginTop: 4, textAlign: 'right' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  }
});

export default IndividualDashboardScreen;
