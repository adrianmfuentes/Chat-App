import 'antd/dist/reset.css';
import React, { useEffect } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { Layout, Menu, notification, Dropdown, Button } from 'antd';
import { Content, Header } from 'antd/es/layout/layout';
import { MenuOutlined } from '@ant-design/icons';

import LoginUserComp from './Components/LoginUserComp';
import RegisterComp from './Components/RegisterComp';
import RoomListComp from './Components/RoomListComp';
import ChatRoomComp from './Components/ChatRoomComp';
import ProtectedRoute from './Components/ProtectedRoute';
import CustomFooter from './Footer/CustomFooter';
import PrivacyPolicy from './Footer/PrivacyPolicy';
import TermsOfService from './Footer/TermsOfService';
import Contact from './Footer/Contact';
import LanguageSelector from './Components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './AuthContext';
import { backendUrl } from './Globals';
import LandingPage from './Components/LandingPage';
import './CSS/Navigation.css';
import './CSS/Global.css';

const CreateChatRoomComp = React.lazy(() => import('./Components/CreateChatRoomComp'));

function AppShell() {
  const { t } = useTranslation();
  const [api, contextHolder] = notification.useNotification();
  const { isAuthenticated, token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // sendBeacon fires a best-effort request during unload without blocking
    // navigation; awaiting fetch() here would not actually delay the unload
    // in most browsers, so the previous fetch-based approach silently failed.
    const handleBeforeUnload = () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        navigator.sendBeacon(`${backendUrl}/api/auth/logout`, currentToken);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const createNotif = (type = 'info', msg, placement = 'top') => {
    api[type]({ message: msg, description: msg, placement });
  };

  const disconnect = () => {
    logout();
    navigate('/login');
  };

  const menuItems = isAuthenticated
    ? [
        { key: 'menuRooms', label: <Link to="/rooms">{t('Chat Rooms')}</Link> },
        { key: 'menuCreateRoom', label: <Link to="/createChatRoom">{t('Create Chat Room')}</Link> },
        { key: 'menuDisconnect', label: <Link to="#" onClick={disconnect}>{t('Log Out')}</Link> },
      ]
    : [
        { key: 'menuRegister', label: <Link to="/register">{t('Register')}</Link> },
        { key: 'menuLogin', label: <Link to="/login">{t('Login')}</Link> },
      ];

  const languageMenu = {
    items: [
      {
        key: 'language',
        label: <LanguageSelector />,
      },
    ],
  };

  return (
    <>
      {contextHolder}
      <Layout className="layout">
        <Header className="navigation-header">
          <div className="navigation-menu">
            <Dropdown menu={languageMenu} trigger={['click']} placement="bottomLeft">
              <Button icon={<MenuOutlined />} />
            </Dropdown>
            <Menu mode="horizontal" theme="dark" style={{ flex: 1 }} items={menuItems} />
          </div>
        </Header>

        <Content className="content-background">
          <React.Suspense fallback={<div>{t('Loading...')}</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginUserComp createNotification={createNotif} />} />
              <Route path="/register" element={<RegisterComp createNotification={createNotif} />} />
              <Route
                path="/rooms"
                element={
                  <ProtectedRoute>
                    <RoomListComp createNotification={createNotif} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/createChatRoom"
                element={
                  <ProtectedRoute>
                    <CreateChatRoomComp createNotification={createNotif} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:roomId"
                element={
                  <ProtectedRoute>
                    <ChatRoomComp key={token} createNotification={createNotif} />
                  </ProtectedRoute>
                }
              />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </React.Suspense>
        </Content>

        <CustomFooter />
      </Layout>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default React.memo(App);
