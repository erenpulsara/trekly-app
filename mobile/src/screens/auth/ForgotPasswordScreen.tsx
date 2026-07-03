import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { authService } from '../../services/api';

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'ForgotPassword'> };

type Step = 'email' | 'reset';

export function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSendCode() {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'E-posta gerekli';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Geçerli bir e-posta girin';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setStep('reset');
    } catch {
      Alert.alert('Hata', 'Bir sorun oluştu, lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword() {
    const newErrors: Record<string, string> = {};
    if (!code.trim() || code.length !== 6) newErrors.code = '6 haneli kodu girin';
    if (!newPassword || newPassword.length < 6) newErrors.newPassword = 'Şifre en az 6 karakter olmalı';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(email.trim().toLowerCase(), code.trim(), newPassword);
      Alert.alert(
        'Başarılı',
        'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.',
        [{ text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }],
      );
    } catch (err) {
      Alert.alert('Hata', err instanceof Error ? err.message : 'Geçersiz veya süresi dolmuş kod.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <View style={styles.titleSection}>
            <View style={styles.titleIcon}>
              <Ionicons name="lock-open-outline" size={24} color="#FF5A1F" />
            </View>
            <Text style={styles.title}>Şifremi Unuttum</Text>
            <Text style={styles.subtitle}>
              {step === 'email'
                ? 'E-posta adresinize doğrulama kodu göndereceğiz.'
                : `${email} adresine gönderilen kodu ve yeni şifrenizi girin.`}
            </Text>
          </View>

          {step === 'email' ? (
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>E-posta</Text>
                <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined as any })); }}
                    placeholder="ornek@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSendCode}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSendCode}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.submitButtonText}>{isLoading ? 'Gönderiliyor...' : 'Kod Gönder'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Doğrulama Kodu</Text>
                <View style={[styles.inputContainer, errors.code ? styles.inputError : null]}>
                  <Ionicons name="key-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={code}
                    onChangeText={(t) => { setCode(t); setErrors((e) => ({ ...e, code: undefined as any })); }}
                    placeholder="000000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    returnKeyType="next"
                  />
                </View>
                {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Yeni Şifre</Text>
                <View style={[styles.inputContainer, errors.newPassword ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={(t) => { setNewPassword(t); setErrors((e) => ({ ...e, newPassword: undefined as any })); }}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                  />
                  <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Şifre Tekrar</Text>
                <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirmPassword: undefined as any })); }}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.submitButtonText}>{isLoading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSendCode} style={styles.resendRow}>
                <Text style={styles.resendText}>Kodu almadın mı? <Text style={styles.resendLink}>Tekrar gönder</Text></Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F7' },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 },
  header: { paddingTop: 12, paddingBottom: 8 },
  backButton: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  titleSection: { paddingTop: 32, paddingBottom: 40, gap: 8 },
  titleIcon: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: '#FFF3EE',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  form: { gap: 18 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E5E5',
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
  },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { flexShrink: 0 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A', padding: 0 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 2 },
  submitButton: {
    backgroundColor: '#FF5A1F', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8,
    shadowColor: '#FF5A1F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resendRow: { alignItems: 'center', marginTop: 4 },
  resendText: { fontSize: 14, color: '#6B7280' },
  resendLink: { color: '#FF5A1F', fontWeight: '700' },
});
