import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../CSS/LandingPage.css';

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className="landing-page-container">
      <div className="landing-page-content">
        <h1 className="landing-title">{t('Welcome to the Chat Application')}</h1>
        <p className="landing-text">{t('Create an account or log in to join real-time chat rooms.')}</p>
        <div className="landing-buttons">
          <Link to="/login">
            <Button className="landing-button" type="primary" size="large">
              {t('Login')}
            </Button>
          </Link>
          <Link to="/register">
            <Button className="landing-button" size="large">
              {t('Register')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
