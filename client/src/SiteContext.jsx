import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import { translations } from './translations.js';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [summary, setSummary] = useState(null);
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('brahmadev_lang') || 'mr';
    } catch {
      return 'mr';
    }
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('brahmadev_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const [fontSize, setFontSizeState] = useState(() => {
    try {
      return localStorage.getItem('brahmadev_fontsize') || 'normal';
    } catch {
      return 'normal';
    }
  });

  const setFontSize = useCallback((size) => {
    setFontSizeState(size);
    try {
      localStorage.setItem('brahmadev_fontsize', size);
    } catch {}
    if (size === 'small') {
      document.documentElement.style.fontSize = '90%';
    } else if (size === 'large') {
      document.documentElement.style.fontSize = '112%';
    } else {
      document.documentElement.style.fontSize = '100%';
    }
  }, []);

  useEffect(() => {
    setFontSize(fontSize);
  }, [fontSize, setFontSize]);

  const refresh = useCallback(async () => {
    const [s, sum] = await Promise.allSettled([api('/public/settings'), api('/public/summary')]);
    if (s.status === 'fulfilled') setSettings(s.value);
    if (sum.status === 'fulfilled') setSummary(sum.value);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const t = translations[lang] || translations.mr;

  return (
    <SiteContext.Provider value={{ settings, summary, refresh, lang, setLang, fontSize, setFontSize, t }}>
      {children}
    </SiteContext.Provider>
  );
}

const defaultSiteValue = {
  settings: null,
  summary: null,
  refresh: () => {},
  lang: 'mr',
  setLang: () => {},
  fontSize: 'normal',
  setFontSize: () => {},
  t: translations.mr,
};

export const useSite = () => useContext(SiteContext) || defaultSiteValue;
