import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [summary, setSummary] = useState(null);

  const refresh = useCallback(async () => {
    const [s, sum] = await Promise.allSettled([api('/public/settings'), api('/public/summary')]);
    if (s.status === 'fulfilled') setSettings(s.value);
    if (sum.status === 'fulfilled') setSummary(sum.value);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return <SiteContext.Provider value={{ settings, summary, refresh }}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
