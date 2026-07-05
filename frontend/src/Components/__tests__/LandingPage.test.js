import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../LandingPage';
import '../../i18.js';

test('renders login and register links', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
  expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register');
});
