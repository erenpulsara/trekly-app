import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const heroVideoSource = require('../../../assets/hero-video.mp4');
const AGENCY_REGISTER_URL = 'https://acenta.treklyapp.com/register';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export function WelcomeScreen({ navigation }: Props) {
  const { continueAsGuest } = useAuth();
  const { t } = useLanguage();

  const player = useVideoPlayer(heroVideoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

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
            <Text style={styles.headline}>
              {t.welcome.title1}{'\n'}
              <Text style={styles.headlineAccent}>{t.welcome.title2}</Text>{'\n'}
              {t.welcome.title3}
            </Text>
            <Text style={styles.subtext}>
              {t.welcome.subtitle}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsSection}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>{t.welcome.joinAdventure}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => Linking.openURL(AGENCY_REGISTER_URL)}
              activeOpacity={0.85}
            >
              <Text style={styles.registerButtonText}>{t.welcome.joinEcosystem}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={continueAsGuest}
            activeOpacity={0.7}
          >
            <Text style={styles.guestButtonText}>{t.welcome.continueGuest}</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <Text style={styles.terms}>
            {t.welcome.termsPre}{' '}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://treklyapp.com/terms')}
            >{t.welcome.terms}</Text>
            {' '}{t.welcome.and}{' '}
            <Text
              style={styles.termsLink}
              onPress={() => Linking.openURL('https://treklyapp.com/privacy')}
            >{t.welcome.privacy}</Text>
            {t.welcome.termsPost}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09091A',
  },
  safeArea: {
    flex: 1,
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
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  headlineAccent: {
    color: '#FF5A1F',
    fontStyle: 'italic',
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 14,
  },
  buttonsSection: {
    gap: 12,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  guestButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
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
