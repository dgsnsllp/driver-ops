import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShieldAlert, Mail, Lock, User } from 'lucide-react-native';
import api from '../api/api';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('corporate');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    console.log('Register attempt:', { name, email, userType });
    if (!name || !email || !password) {
      if (Platform.OS === 'web') window.alert('Hata: Lütfen tüm alanları doldurun.');
      else Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      console.log('Sending API request...');
      const formattedEmail = email.trim().toLowerCase();
      const response = await api.post('/auth/register', { name, email: formattedEmail, password, userType });
      console.log('API response:', response.data);
      if (response.data.token) {
        if (Platform.OS === 'web') {
          window.alert('Başarılı: Kayıt başarılı, lütfen giriş yapın.');
          navigation.navigate('Login');
        } else {
          Alert.alert('Başarılı', 'Kayıt başarılı, lütfen giriş yapın.', [
            { text: 'Tamam', onPress: () => navigation.navigate('Login') }
          ]);
        }
      }
    } catch (error) {
      console.log('API error:', error);
      const errorMsg = error.response?.data?.error || 'Kayıt sırasında bir hata oluştu.';
      if (Platform.OS === 'web') window.alert(`Hata: ${errorMsg}`);
      else Alert.alert('Hata', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <ShieldAlert color="#00d4ff" size={64} />
          <Text style={styles.appName}>SÜRÜCÜ OPS</Text>
          <Text style={styles.subtitle}>Yeni Hesap Oluştur</Text>
        </View>

        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeBtn, userType === 'individual' && styles.typeBtnActive]} 
            onPress={() => setUserType('individual')}
          >
            <Text style={[styles.typeText, userType === 'individual' && styles.typeTextActive]}>Bireysel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, userType === 'corporate' && styles.typeBtnActive]} 
            onPress={() => setUserType('corporate')}
          >
            <Text style={[styles.typeText, userType === 'corporate' && styles.typeTextActive]}>Şirket</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <User color="#a0a0b0" size={20} style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Ad Soyad veya Şirket Adı"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
            />
          </View>

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
              placeholder="Şifre"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>KAYIT OL</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Zaten hesabın var mı? <Text style={styles.linkTextHighlight}>Giriş Yap</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e17',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#121826',
    borderRadius: 8,
    padding: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeBtnActive: {
    backgroundColor: '#00d4ff',
  },
  typeText: {
    color: '#a0a0b0',
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#000',
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
  registerBtn: {
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
  registerBtnText: {
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

export default RegisterScreen;
