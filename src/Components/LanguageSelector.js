import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Select defaultValue={i18n.language} onChange={handleChangeLanguage} style={{ width: 120 }}>
      <Select.Option value="en">English</Select.Option>
      <Select.Option value="es">Español</Select.Option>
      {/* Agrega más idiomas si es necesario */}
    </Select>
  );
};

export default LanguageSelector;
