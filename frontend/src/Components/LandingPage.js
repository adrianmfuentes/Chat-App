import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className="landing-page">
      <h1>{t('Welcome to the Chat Application')}</h1>
      <p>{t('Create an account or log in to join real-time chat rooms.')}</p>
      <Link to="/login">
        <Button type="primary">{t('Login')}</Button>
      </Link>
      <Link to="/register">
        <Button>{t('Register')}</Button>
      </Link>
    </div>
  );
};

export default LandingPage;
