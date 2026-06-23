'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Lang, agT } from './i18n';

export type Translations = typeof agT['tr'];

interface LangCtxType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangCtx = createContext<LangCtxType>({
  lang: 'tr',
  setLang: () => {},
  t: agT.tr,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
    if (m?.[1] === 'en') setLangState('en');
  }, []);

  const setLang = (l: Lang) => {
    document.cookie = `lang=${l};path=/;max-age=${60 * 60 * 24 * 365}`;
    setLangState(l);
  };

  return (
    <LangCtx.Provider value={{ lang, setLang, t: agT[lang] }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}
