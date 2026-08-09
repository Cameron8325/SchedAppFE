import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../api/client', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

import { AuthContext } from '../context/AuthContext';
import LoginPage from './LoginPage';

describe('LoginPage', () => {
  it('supports password-manager autofill without hiding account creation', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ login: jest.fn() }}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('textbox', { name: /username or email/i })).toHaveAttribute(
      'autocomplete',
      'username',
    );
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      'autocomplete',
      'current-password',
    );
    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute(
      'href',
      '/register',
    );
  });
});
