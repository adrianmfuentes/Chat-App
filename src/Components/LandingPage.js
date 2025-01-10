import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div>
      <h1>Welcome to the Chat Application</h1>
      <Link to="/login">
        <Button type="primary">Login</Button>
      </Link>
      <Link to="/register">
        <Button>Register</Button>
      </Link>
    </div>
  );
};

export default LandingPage;
