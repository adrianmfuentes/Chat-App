import React, { useState } from 'react';
import { Input, Button, Form } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import '../CSS/LoginUser.css';

const RegisterComp = ({ createNotification }) => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async ({ username, password }) => {
    setLoading(true);
    try {
      await register(username, password);
      createNotification('success', t('Registration successful'));
      navigate('/rooms');
    } catch (err) {
      createNotification('error', err.message || t('Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-user-container">
      <div className="login-card">
        <Form onFinish={handleRegister} layout="vertical">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: t('Username is required') },
              { min: 3, message: t('Username must be at least 3 characters') },
            ]}
          >
            <Input className="login-input" placeholder={t('Username')} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: t('Password is required') },
              { min: 8, message: t('Password must be at least 8 characters') },
            ]}
          >
            <Input.Password className="login-input" placeholder={t('Password')} />
          </Form.Item>
          <Button className="login-button" type="primary" htmlType="submit" loading={loading} block>
            {t('Register')}
          </Button>
        </Form>
        <p>
          {t('Already have an account?')} <Link to="/login">{t('Login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterComp;
