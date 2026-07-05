import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginUserComp from '../LoginUserComp';
import { AuthProvider } from '../../AuthContext';
import '../../i18.js';

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

test('logs in successfully and stores the token', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ token: 'abc123', user: { id: '1', username: 'alice' } }),
  });

  const createNotification = jest.fn();
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginUserComp createNotification={createNotification} />
      </MemoryRouter>
    </AuthProvider>
  );

  await userEvent.type(screen.getByPlaceholderText('Username'), 'alice');
  await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => expect(localStorage.getItem('token')).toBe('abc123'));
  expect(createNotification).toHaveBeenCalledWith('success', expect.any(String));
});

test('shows an error notification on invalid credentials', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({ error: 'Invalid username or password' }),
  });

  const createNotification = jest.fn();
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginUserComp createNotification={createNotification} />
      </MemoryRouter>
    </AuthProvider>
  );

  await userEvent.type(screen.getByPlaceholderText('Username'), 'alice');
  await userEvent.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() =>
    expect(createNotification).toHaveBeenCalledWith('error', 'Invalid username or password')
  );
  expect(localStorage.getItem('token')).toBeNull();
});
