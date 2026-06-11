import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { ShieldAlert, X, Search } from 'lucide-react-native';
import api from '../api/api';

const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [plate, setPlate] = useState('');
  const [searching, setSearching] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    let driverId = data;
    
    // Remove "DRIVER-" prefix or extract from web URL
    if (data.includes('/report/')) {
      const parts = data.split('/report/');
      driverId = parts[parts.length - 1];
    } else if (data.startsWith('DRIVER-')) {
      driverId = data.replace('DRIVER-', '');
    }
    
    navigation.navigate('Report', { targetData: driverId });
    setTimeout(() => setScanned(false), 2000);
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') window.alert(`${title}: ${message}`);
    else Alert.alert(title, message);
  };

  const handleManualSearch = async () => {
    if (!plate.trim()) {
      showAlert('Hata', 'Lütfen bir plaka girin.');
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/vehicles/search?plate=${plate}`);
      if (res.data.driverId) {
        setPlate(''); // clear input
        navigation.navigate('Report', { targetData: res.data.driverId });
      }
    } catch (error) {
      showAlert('Hata', error.response?.data?.error || 'Araç bulunamadı.');
    } finally {
      setSearching(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>Kamera izni isteniyor...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text style={styles.text}>Kameraya erişim izni reddedildi.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Üst Kısım UI */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <X color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR KOD OKUTUN</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tarama Karesi */}
        <View style={styles.scanFrameContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.scanText}>Araç camındaki QR kodu bu alana hizalayın</Text>
          
          {/* Manuel Plaka Arama */}
          <View style={styles.manualSearchContainer}>
            <Text style={styles.manualSearchTitle}>Veya Plaka ile Sürücüye Ulaşın</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.plateInput}
                placeholder="Örn: 34ABC123"
                placeholderTextColor="#9ca3af"
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleManualSearch} disabled={searching}>
                {searching ? <ActivityIndicator color="#000" size="small" /> : <Search color="#000" size={20} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#00d4ff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scanFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
    marginBottom: 24,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00d4ff',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  scanText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  manualSearchContainer: {
    width: '80%',
    backgroundColor: 'rgba(18, 24, 38, 0.9)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  manualSearchTitle: {
    color: '#a0a0b0',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateInput: {
    flex: 1,
    backgroundColor: '#0a0e17',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    marginRight: 8,
  },
  searchBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#00d4ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default QRScannerScreen;
