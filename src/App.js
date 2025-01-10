import 'antd/dist/reset.css';
import React, { useEffect, useState, Suspense } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { Layout, Menu, notification, Dropdown, Button } from 'antd';
import { Content, Header } from 'antd/es/layout/layout';
import { MenuOutlined } from '@ant-design/icons';

import LoginUserComp from './Components/LoginUserComp';
import ChatRoomComp from './Components/ChatRoomComp';
import CustomFooter from './Footer/CustomFooter';
import PrivacyPolicy from './Footer/PrivacyPolicy';
import TermsOfService from './Footer/TermsOfService';
import Contact from './Footer/Contact';
import LanguageSelector from './Components/LanguageSelector';
import { useTranslation } from 'react-i18next'; 
import { backendUrl } from './Globals';
import LandingPage from './Components/LandingPage';
import './CSS/Navigation.css'; 
import './CSS/Global.css';

const CreateChatRoomComp = React.lazy(() => import('./Components/CreateChatRoomComp'));

function App() {
  const { t } = useTranslation(); // Traducción
  const [api, contextHolder] = notification.useNotification(); 
  const [login, setLogin] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey");
    if (apiKey) setLogin(true); 

    const handleBeforeUnload = async (event) => {
      if (apiKey) {
        await fetch(`${backendUrl}/user/disconnect?apiKey=${apiKey}`); 
        localStorage.removeItem("apiKey"); 
        setLogin(false); 
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); 

  const createNotif = (type = "info", msg, placement = "top") => {
    api[type]({ message: msg, description: msg, placement }); 
  };

  const disconnect = async () => {
    const apiKey = localStorage.getItem("apiKey");
    if (apiKey) {
      await fetch(`${backendUrl}/user/disconnect?apiKey=${apiKey}`); 
      localStorage.removeItem("apiKey"); 
      setLogin(false); 
      navigate("/login"); 
    }
  };

  const menuItems = login
    ? [
        { key: "menuJoinRoom", label: <Link to="/joinChat">{t("Join Chat Room")}</Link> },
        { key: "menuCreateRoom", label: <Link to="/createChatRoom">{t("Create Chat Room")}</Link> },
        { key: "menuDisconnect", label: <Link to="#" onClick={disconnect}>{t("Log Out")}</Link> }
      ]
    : [
        { key: "menuRegister", label: <Link to="/register">{t("Register")}</Link> },
        { key: "menuLogin", label: <Link to="/login">{t("Login")}</Link> }
      ];

  const menu = (
    <Menu>
      <Menu.Divider />
      <Menu.SubMenu key="sub1" title={t("Language")}>
        <LanguageSelector />
      </Menu.SubMenu>
    </Menu>
  );

  return (
    <>
      {contextHolder}
      <Layout className='layout'>
        <Header className="navigation-header">
          <div className="navigation-menu">
            <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft">
              <Button icon={<MenuOutlined />} />
            </Dropdown>
            <Menu mode='horizontal' theme='dark' style={{ flex: 1 }}>
              {menuItems.map(item => (
                <Menu.Item key={item.key}>{item.label}</Menu.Item>
              ))}
            </Menu>
          </div>
        </Header>

        <Content className="content-background">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginUserComp setLogin={setLogin} createNotification={createNotif} />} />
              <Route path="/joinChat" element={<ChatRoomComp createNotification={createNotif} />} />
              <Route path="/createChatRoom" element={<CreateChatRoomComp createNotification={createNotif} />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </Content>

        <CustomFooter />
      </Layout>
    </>
  );
}

export default React.memo(App);
