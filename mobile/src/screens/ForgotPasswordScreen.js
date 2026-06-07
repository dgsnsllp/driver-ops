import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShieldAlert, Mail, Lock } from 'lucide-react-native';
import api from '../api/api';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleReset = async () => {
    if (!email || !newPassword) {
      if (Platform.OS === 'web') window.alert('Hata: Lütfen tüm alanları doldurun.');
      else Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email, newPassword });
      if (response.data.message) {
        if (Platform.OS === 'web') {
          window.alert('Başarılı: Şifreniz başarıyla güncellendi.');
          navigation.navigate('Login');
        } else {
          Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.', [
            { text: 'Tamam', onPress: () => navigation.navigate('Login') }
          ]);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Bir hata oluştu.';
      if (Platform.OS === 'web') window.alert(`Hata: ${errorMsg}`);
      else Alert.alert('Hata', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.logoContainer}>
        <ShieldAlert color="#00d4ff" size={64} />
        <Text style={styles.appName}>SÜRÜCÜ OPS</Text>
        <Text style={styles.subtitle}>Şifre Sıfırlama</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Mail color="#a0a0b0" size={20} style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="E-Posta Adresi"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock color="#a0a0b0" size={20} style={styles.icon} />
          <TextInput 
            style={styles.input}
            placeholder="Yeni Şifre"
            placeholderTextColor="#666"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetBtnText}>ŞİFREYİ SIFIRLA</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>İptal et ve <Text style={styles.linkTextHighlight}>Giriş'e Dön</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e17',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00d4ff',
    marginTop: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0b0',
    marginTop: 4,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121826',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 16,
  },
  resetBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00d4ff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  resetBtnText: {
    color: '#00d4ff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  linkBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  linkText: {
    color: '#a0a0b0',
    fontSize: 14,
  },
  linkTextHighlight: {
    color: '#00d4ff',
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
