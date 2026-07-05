import React, { useEffect, useState } from 'react';
import { List, Button, Spin } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { listRooms } from '../api';

const RoomListComp = ({ createNotification }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    listRooms(token)
      .then(({ rooms: fetched }) => {
        if (!cancelled) setRooms(fetched);
      })
      .catch((err) => {
        if (!cancelled) createNotification('error', err.message || t('Failed to load rooms'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, createNotification, t]);

  return (
    <div>
      <h2>{t('Chat Rooms')}</h2>
      <Link to="/createChatRoom">
        <Button type="primary" style={{ marginBottom: 16 }}>
          {t('Create Chat Room')}
        </Button>
      </Link>
      {loading ? (
        <Spin />
      ) : (
        <List
          bordered
          dataSource={rooms}
          locale={{ emptyText: t('No rooms yet. Create the first one!') }}
          renderItem={(room) => (
            <List.Item
              actions={[
                <Button key="join" type="link" onClick={() => navigate(`/chat/${room.id}`)}>
                  {t('Join')}
                </Button>,
              ]}
            >
              {room.name}
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default RoomListComp;
