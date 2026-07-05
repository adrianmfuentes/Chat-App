import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pl', label: 'Polski' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العربية' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleChangeLanguage}
      style={{ width: 140 }}
      options={LANGUAGES.map(({ code, label }) => ({ value: code, label }))}
    />
  );
};

export default LanguageSelector;
