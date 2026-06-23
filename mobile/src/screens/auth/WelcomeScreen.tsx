import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';

const { height } = Dimensions.get('window');

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A3A2A', '#2D5A3D', '#1A3A2A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Trekly</Text>
          </View>

          {/* Hero text */}
          <View style={styles.heroSection}>
            <Text style={styles.headline}>Doğayı keşfet,{'\n'}yeni rotalar bul.</Text>
            <Text style={styles.subtext}>
              Türkiye'nin en kapsamlı outdoor{'\n'}aktivite pazaryeri.
            </Text>
          </View>

          {/* Feature pills */}
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <Ionicons name="compass-outline" size={14} color="#FF5A1F" />
              <Text style={styles.pillText}>Rotalar</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="people-outline" size={14} color="#FF5A1F" />
              <Text style={styles.pillText}>Topluluk</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="trophy-outline" size={14} color="#FF5A1F" />
              <Text style={styles.pillText}>Puanlar</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsSection}>
            <TouchableOpacity style={styles.appleButton} activeOpacity={0.85}>
              <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
              <Text style={styles.appleButtonText}>Apple ile devam et</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Google ile devam et</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>VEYA</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>Giriş yap / Kayıt ol</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            Devam ederek{' '}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://treklyapp.com/terms')}
            >Kullanım Koşulları</Text>
            {' '}ve{' '}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://treklyapp.com/privacy')}
            >Gizlilik Politikası</Text>
            'nı kabul etmiş olursunuz.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3A2A',
  },
  safeArea: {
    flex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.08,
    backgroundColor: '#FFFFFF',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -80,
    right: -80,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 200,
    left: -60,
  },
  circle3: {
    width: 150,
    height: 150,
    top: height * 0.35,
    right: -40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'center',
  },
  logoIcon: {
    width: 52,
    height: 52,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSection: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 14,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pillText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonsSection: {
    gap: 12,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1C1C1E',
    paddingVertical: 16,
    borderRadius: 14,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 14,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  googleButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  loginButton: {
    backgroundColor: '#FF5A1F',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  terms: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'underline',
  },
});
