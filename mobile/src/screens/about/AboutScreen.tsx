import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { TreklyLogo } from '../../components/common/TreklyLogo';

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'About'>;
};

const PILLARS: Array<{ icon: React.ComponentProps<typeof Ionicons>['name']; title: string; body: string }> = [
  {
    icon: 'leaf-outline',
    title: 'Nitelikli Deneyimler',
    body: 'Sadece en popüler olanları değil, en nitelikli ve gerçek doğa deneyimlerini bir araya getiriyoruz.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Güvenilir Acentalar',
    body: 'Platformdaki acentaları TURSAB kayıtlarıyla doğruluyor, güvenli rezervasyon imkanı sunuyoruz.',
  },
  {
    icon: 'people-outline',
    title: 'Gerçek Topluluk',
    body: 'Doğa tutkunlarını nitelikli outdoor deneyimleriyle buluşturan yeni nesil bir dijital platformuz.',
  },
];

export function AboutScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hakkımızda</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.logoWrap}>
          <TreklyLogo size="medium" />
        </View>

        <Text style={styles.title}>Doğayı Keşfetmenin En Düzenli Yolu</Text>

        <Text style={styles.body}>
          Trekly; doğa tutkunlarını, Türkiye'nin nitelikli outdoor deneyimleriyle buluşturan
          yeni nesil bir dijital platformdur.
        </Text>

        <Text style={styles.body}>
          Amacımız; yürüyüşten kampçılığa, bisiklet rotalarından su sporlarına kadar tüm doğa
          faaliyetlerini, herkes için düzenli ve kolayca filtrelenebilir tek bir vitrinde toplamak.
        </Text>

        {/* Pillars */}
        <View style={styles.pillars}>
          {PILLARS.map((p) => (
            <View key={p.title} style={styles.pillarCard}>
              <View style={styles.pillarIcon}>
                <Ionicons name={p.icon} size={22} color="#FF5A1F" />
              </View>
              <Text style={styles.pillarTitle}>{p.title}</Text>
              <Text style={styles.pillarBody}>{p.body}</Text>
            </View>
          ))}
        </View>

        {/* Contact */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Bize Ulaşın</Text>
          <Text style={styles.contactSub}>Soru ve görüşleriniz için:</Text>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL('mailto:hello@treklyapp.com')}
            activeOpacity={0.85}
          >
            <Ionicons name="mail-outline" size={18} color="#FF5A1F" />
            <Text style={styles.contactBtnText}>hello@treklyapp.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactBtn}
            onPress={() => Linking.openURL('https://www.treklyapp.com')}
            activeOpacity={0.85}
          >
            <Ionicons name="globe-outline" size={18} color="#FF5A1F" />
            <Text style={styles.contactBtnText}>www.treklyapp.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 25,
    marginBottom: 14,
    textAlign: 'center',
  },
  pillars: {
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  pillarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pillarIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF3EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pillarBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  contactSub: {
    fontSize: 13,
    color: '#6B7280',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF3EE',
    borderRadius: 12,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5A1F',
  },
});
