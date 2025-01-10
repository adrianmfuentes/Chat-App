import React, { useEffect, useState } from 'react';
import { Input, Button, List, notification } from 'antd';
import { useNavigate } from 'react-router-dom';

const ChatRoomComp = ({ createNotification }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Conectarse al WebSocket
    const newSocket = new WebSocket('ws://localhost:4000'); // Asegúrate de usar la URL correcta para tu servidor
    setSocket(newSocket);

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    newSocket.onclose = () => {
      createNotification('error', 'Connection lost');
      navigate('/login');
    };

    return () => {
      newSocket.close();
    };
  }, [navigate, createNotification]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      username: 'User', // Usa el nombre de usuario del usuario autenticado
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    socket.send(JSON.stringify(message));
    setNewMessage('');
  };

  return (
    <div>
      <List
        dataSource={messages}
        renderItem={(message) => (
          <List.Item>
            <strong>{message.username}</strong>: {message.text}
          </List.Item>
        )}
      />
      <Input.TextArea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        rows={4}
      />
      <Button type="primary" onClick={handleSendMessage}>
        Send Message
      </Button>
    </div>
  );
};

export default ChatRoomComp;
