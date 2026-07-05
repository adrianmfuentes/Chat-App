import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { createRoom } from '../api';

const CreateChatRoomComp = ({ createNotification }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      createNotification('error', t('Room name is required'));
      return;
    }

    setLoading(true);
    try {
      const room = await createRoom(token, roomName.trim());
      createNotification('success', t('Chat room "{{name}}" created', { name: room.name }));
      navigate(`/chat/${room.id}`);
    } catch (err) {
      createNotification('error', err.message || t('Failed to create room'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Input
        placeholder={t('Enter room name')}
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        onPressEnter={handleCreateRoom}
      />
      <Button type="primary" onClick={handleCreateRoom} loading={loading} style={{ marginTop: 12 }}>
        {t('Create Chat Room')}
      </Button>
    </div>
  );
};

export default CreateChatRoomComp;
