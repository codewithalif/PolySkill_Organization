"use client";

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { translations, Language, TranslationKey } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey | string, fallback?: string) => string;
  isMounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const emptySubscribe = () => () => {};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    try {
      const saved = localStorage.getItem("polyskill_lang") as Language | null;
      if (saved === "en" || saved === "bn") {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return "en";
  });
  
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // Ignore
    }
  }, [language]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("polyskill_lang", newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  const t = (key: TranslationKey | string, fallback?: string): string => {
    const langDict = translations[language] as Record<string, string>;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const defaultDict = translations.en as Record<string, string>;
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isMounted,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

const defaultContext: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: TranslationKey | string, fallback?: string): string => {
    const defaultDict = translations.en as Record<string, string>;
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  },
  isMounted: false,
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context || defaultContext;
}
