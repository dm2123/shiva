'use client';

import { useI18n } from '@/contexts/I18nContext';

export default function LanguageToggle() {
  const { language, setLanguage, languages } = useI18n();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as any)}
      className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
