import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, List } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import { getRoomMessages } from '../api';
import { wsBackendUrl } from '../Globals';

const ChatRoomComp = ({ createNotification }) => {
  const { t } = useTranslation();
  const { roomId } = useParams();
  const { token, username } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    getRoomMessages(token, roomId)
      .then(({ messages: history }) => {
        if (!cancelled) setMessages(history.map((m) => ({ ...m, type: 'message' })));
      })
      .catch((err) => {
        if (!cancelled) createNotification('error', err.message || t('Failed to load room'));
      });

    const socket = new WebSocket(
      `${wsBackendUrl}/ws?token=${encodeURIComponent(token)}&roomId=${encodeURIComponent(roomId)}`
    );
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'error') {
        createNotification('error', message.text);
        return;
      }
      setMessages((prev) => [...prev, message]);
    };

    socket.onclose = () => {
      setConnected(false);
      if (!cancelled) {
        createNotification('error', t('Connection lost'));
        navigate('/rooms');
      }
    };

    return () => {
      cancelled = true;
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, token]);

  const handleSendMessage = () => {
    const text = newMessage.trim();
    if (!text || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(JSON.stringify({ text }));
    setNewMessage('');
  };

  return (
    <div>
      <List
        bordered
        dataSource={messages}
        renderItem={(message, index) => (
          <List.Item key={message.id || index}>
            {message.type === 'system' ? (
              <em>{message.text}</em>
            ) : (
              <>
                <strong>{message.username === username ? t('You') : message.username}</strong>:{' '}
                {message.text}
              </>
            )}
          </List.Item>
        )}
      />
      <Input.TextArea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onPressEnter={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        rows={3}
        disabled={!connected}
      />
      <Button type="primary" onClick={handleSendMessage} disabled={!connected} style={{ marginTop: 8 }}>
        {t('Send Message')}
      </Button>
    </div>
  );
};

export default ChatRoomComp;
