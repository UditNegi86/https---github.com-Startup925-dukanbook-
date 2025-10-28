import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  Language,
  translations,
  TFunction,
  LanguageArray,
} from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TFunction;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(LanguageArray[0]);

  const t = useCallback(
    (key: string, options?: Record<string, string | number>): string => {
      let translation = translations[language][key] || key;

      if (options) {
        Object.keys(options).forEach((optionKey) => {
          const regex = new RegExp(`{{${optionKey}}}`, "g");
          translation = translation.replace(regex, String(options[optionKey]));
        });
      }

      return translation;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};