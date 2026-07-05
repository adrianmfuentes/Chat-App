import React, { useState } from 'react';
import { Input, Button, Form } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import '../CSS/LoginUser.css';

const LoginUserComp = ({ createNotification }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async ({ username, password }) => {
    setLoading(true);
    try {
      await login(username, password);
      createNotification('success', t('Login successful'));
      navigate('/rooms');
    } catch (err) {
      createNotification('error', err.message || t('Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-user-container">
      <div className="login-card">
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: t('Username is required') }]}>
            <Input className="login-input" placeholder={t('Username')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t('Password is required') }]}>
            <Input.Password className="login-input" placeholder={t('Password')} />
          </Form.Item>
          <Button className="login-button" type="primary" htmlType="submit" loading={loading} block>
            {t('Login')}
          </Button>
        </Form>
        <p>
          {t("Don't have an account?")} <Link to="/register">{t('Register')}</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginUserComp;
