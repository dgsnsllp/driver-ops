import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock } from 'lucide-react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('corporate');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    setLoading(true);
    const result = await login(email, password, userType);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Giriş Başarısız', result.error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.logoContainer}>
        <ShieldAlert color="#00d4ff" size={64} />
        <Text style={styles.appName}>SÜRÜCÜ OPS</Text>
        <Text style={styles.subtitle}>Mobil Yönetim Paneli</Text>
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

        <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Şifremi Unuttum</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>SİSTEME GİRİŞ YAP</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerLinkBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLinkText}>Hesabın yok mu? <Text style={styles.registerLinkHighlight}>Kayıt Ol</Text></Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>VEYA</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.qrBtn} onPress={() => navigation.navigate('QRScanner')}>
          <Text style={styles.qrBtnText}>📸 Araç İhbar Et / QR Okut</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e17', // Koyu Arka Plan
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
  loginBtn: {
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
  loginBtnText: {
    color: '#00d4ff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: '#a0a0b0',
    fontSize: 12,
  },
  registerLinkBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  registerLinkText: {
    color: '#a0a0b0',
    fontSize: 14,
  },
  registerLinkHighlight: {
    color: '#00d4ff',
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1f2937',
  },
  dividerText: {
    color: '#6b7280',
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  }
});

export default LoginScreen;
