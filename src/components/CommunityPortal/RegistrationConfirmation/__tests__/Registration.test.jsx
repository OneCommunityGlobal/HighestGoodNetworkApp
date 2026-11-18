import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import RegistrationPage from '../Registration';

const mockStore = configureMockStore([]);

const renderRegistrationPage = (
  initialState = {
    theme: { darkMode: false },
    userProfile: { firstName: 'Jane', lastName: 'Doe' },
    auth: { user: { email: 'jane@example.com' } },
  },
) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RegistrationPage />
      </MemoryRouter>
    </Provider>,
  );
};

describe('RegistrationPage component', () => {
  test('renders Register button', () => {
    renderRegistrationPage();
    expect(screen.getByRole('button', { name: /^Register$/i })).toBeInTheDocument();
  });

  test('opens RegistrationPopup when Register button is clicked', () => {
    renderRegistrationPage();

    expect(screen.queryByText('Thank you for Registering!')).not.toBeInTheDocument();

    const registerBtn = screen.getByRole('button', { name: /^Register$/i });
    fireEvent.click(registerBtn);

    expect(screen.getByText('Thank you for Registering!')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  test('closes RegistrationPopup when close button is clicked', () => {
    renderRegistrationPage();

    const registerBtn = screen.getByRole('button', { name: /^Register$/i });
    fireEvent.click(registerBtn);

    expect(screen.getByText('Thank you for Registering!')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close registration popup/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Thank you for Registering!')).not.toBeInTheDocument();
  });

  test('applies darkMode class when theme.darkMode is true', () => {
    renderRegistrationPage({
      theme: { darkMode: true },
      userProfile: {},
      auth: {},
    });
    expect(screen.getByTestId('registration-page-wrapper').className).toMatch(/darkMode/);
  });
});
