import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type * as GoogleSigninModule from '@react-native-google-signin/google-signin';
import { useLanguage } from '../../context/LanguageContext';

const WEB_CLIENT_ID = '835377577547-bnnjpakff03a0fbprgb48dp9j27o5eg2.apps.googleusercontent.com';
const IOS_CLIENT_ID = '835377577547-m89lanr04d2p7jacq115qlok3gf1rg2i.apps.googleusercontent.com';

// Bu native modül Expo Go'da mevcut değil (yalnızca dev/production build'lerde
// çalışır). Statik `import` kullanırsak modül bulunamadığında UYGULAMA AÇILIŞTA
// çöker (tüm ekranlar navigator tarafından önceden yüklendiği için). Bu yüzden
// çalışma zamanında `require()` ile, try/catch içinde yükleniyor — modül yoksa
// buton devre dışı görünür, uygulamanın geri kalanı çalışmaya devam eder.
let cachedModule: typeof GoogleSigninModule | null | undefined;
function loadGoogleSignin(): typeof GoogleSigninModule | null {
  if (cachedModule !== undefined) return cachedModule;
  let mod: typeof GoogleSigninModule | null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('@react-native-google-signin/google-signin');
  } catch {
    mod = null;
  }
  cachedModule = mod;
  return mod;
}

let configured = false;
function ensureConfigured(mod: typeof GoogleSigninModule) {
  if (configured) return;
  // Android'de de "webClientId" verilir — dönen idToken'ın audience'ı bu
  // Web client'a ait olur, backend token'ı bu audience ile doğrular.
  // iOS'ta ayrıca "iosClientId" gerekir (native SDK'nın kendi kimliği için).
  mod.GoogleSignin.configure({ webClientId: WEB_CLIENT_ID, iosClientId: IOS_CLIENT_ID });
  configured = true;
}

interface Props {
  onSuccess: (idToken: string) => void;
  onError?: (message: string) => void;
}

export function GoogleSignInButton({ onSuccess, onError }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  async function handlePress() {
    const mod = loadGoogleSignin();
    if (!mod) {
      onError?.(
        'Google girişi bu ortamda kullanılamıyor (native build gerekiyor).'
      );
      return;
    }
    ensureConfigured(mod);
    setLoading(true);
    try {
      // Önceki oturumu temizle — aksi halde tek hesap varsa Google seçim
      // ekranını atlayıp otomatik o hesapla devam eder. Her basışta hesap
      // seçtirmek için önce çıkış yapılır (oturum yoksa sessizce hata verir).
      await mod.GoogleSignin.signOut().catch(() => {});
      await mod.GoogleSignin.hasPlayServices();
      const response = await mod.GoogleSignin.signIn();
      if (mod.isSuccessResponse(response) && response.data.idToken) {
        onSuccess(response.data.idToken);
      }
      // cancelled response: kullanıcı vazgeçti, sessizce çık
    } catch (err) {
      if (mod.isErrorWithCode(err) && err.code === mod.statusCodes.SIGN_IN_CANCELLED) {
        // vazgeçildi, hata gösterme
      } else {
        onError?.(t.auth.googleLoginFailed ?? 'Google girişi başarısız oldu.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} disabled={loading} activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator size="small" color="#3A3A3A" />
      ) : (
        <View style={styles.content}>
          <Ionicons name="logo-google" size={18} color="#3A3A3A" />
          <Text style={styles.text}>{t.auth.continueWithGoogle ?? 'Google ile devam et'}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A3A3A',
  },
});
