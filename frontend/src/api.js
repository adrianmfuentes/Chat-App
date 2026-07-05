import { backendUrl } from './Globals';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const request = async (path, { method = 'GET', body, token } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${backendUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Unable to reach the server', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status);
  }
  return data;
};

export const register = (username, password) =>
  request('/api/auth/register', { method: 'POST', body: { username, password } });

export const login = (username, password) =>
  request('/api/auth/login', { method: 'POST', body: { username, password } });

export const listRooms = (token) => request('/api/rooms', { token });

export const createRoom = (token, name) =>
  request('/api/rooms', { method: 'POST', body: { name }, token });

export const getRoomMessages = (token, roomId) =>
  request(`/api/rooms/${roomId}/messages`, { token });

export { ApiError };
