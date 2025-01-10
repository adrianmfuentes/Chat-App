import React, { useState } from 'react';
import { Input, Button, Form, notification } from 'antd';
import { useNavigate } from 'react-router-dom';

const LoginUserComp = ({ setLogin, createNotification }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Aquí puedes hacer una llamada a tu backend para verificar las credenciales
    if (username && password) {
      // Simulación de login
      localStorage.setItem('apiKey', 'some-fake-api-key');
      setLogin(true);
      createNotification('success', 'Login successful');
      navigate('/joinChat');
    } else {
      createNotification('error', 'Please fill in both fields');
    }
  };

  return (
    <div>
      <Form onFinish={handleLogin}>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input.Password
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="primary" htmlType="submit">Login</Button>
      </Form>
    </div>
  );
};

export default LoginUserComp;