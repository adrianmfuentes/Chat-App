import React, { useState } from 'react';
import { Input, Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';

const CreateChatRoomComp = ({ createNotification }) => {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      createNotification('error', 'Room name is required');
      return;
    }

    // Aquí deberías hacer la lógica para crear la sala en el servidor
    // Para la demostración, simplemente redirigiremos a la sala de chat
    navigate('/joinChat');
    createNotification('success', `Chat room "${roomName}" created`);
  };

  return (
    <div>
      <Input
        placeholder="Enter room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <Button type="primary" onClick={handleCreateRoom}>
        Create Chat Room
      </Button>
    </div>
  );
};

export default CreateChatRoomComp;
