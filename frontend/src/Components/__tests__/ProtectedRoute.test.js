import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../AuthContext';

const renderWithRoute = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/rooms']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <div>Secret Rooms</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

beforeEach(() => {
  localStorage.clear();
});

test('redirects unauthenticated users to /login', () => {
  renderWithRoute();
  expect(screen.getByText('Login Page')).toBeInTheDocument();
});

test('renders protected content for authenticated users', () => {
  localStorage.setItem('token', 'fake-token');
  localStorage.setItem('username', 'alice');
  renderWithRoute();
  expect(screen.getByText('Secret Rooms')).toBeInTheDocument();
});
