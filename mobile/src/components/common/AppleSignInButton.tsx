import React from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

interface Props {
  onSuccess: (identityToken: string, fullName?: string) => void;
  onError?: (message: string) => void;
}

// Apple'ın App Store kuralı gereği yalnızca Apple'ın kendi hazır tasarımıyla
// gösterilebilir (kendi buton tasarımımızı kullanamayız) ve yalnızca iOS'ta
// anlamlıdır — Android'de bu bileşen hiç render edilmemeli.
export function AppleSignInButton({ onSuccess, onError }: Props) {
  if (Platform.OS !== 'ios') return null;

  async function handlePress() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        onError?.('Apple girişi başarısız oldu.');
        return;
      }
      const fullName = credential.fullName
        ? AppleAuthentication.formatFullName(credential.fullName)
        : undefined;
      onSuccess(credential.identityToken, fullName);
    } catch (err: any) {
      if (err?.code === 'ERR_REQUEST_CANCELED') {
        // vazgeçildi, hata gösterme
        return;
      }
      onError?.('Apple girişi başarısız oldu.');
    }
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={100}
      style={{ width: '100%', height: 48 }}
      onPress={handlePress}
    />
  );
}
