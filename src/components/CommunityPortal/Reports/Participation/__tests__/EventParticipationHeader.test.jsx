import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import EventParticipationHeader from '../EventParticipationHeader';

const mockStore = configureMockStore([]);

const renderHeader = (auth = {}) =>
  render(
    <Provider store={mockStore({ theme: { darkMode: false }, auth })}>
      <EventParticipationHeader />
    </Provider>,
  );

describe('EventParticipationHeader - profile picture', () => {
  it("shows the user's photo with an accessible name", () => {
    renderHeader({ firstName: 'Gayatri', profilePic: 'https://example.com/me.png' });
    const avatar = screen.getByRole('img', { name: "Gayatri's profile picture" });
    expect(avatar).toHaveAttribute('src', 'https://example.com/me.png');
  });

  it('falls back to the default avatar when there is no photo', () => {
    renderHeader();
    const avatar = screen.getByRole('img', { name: 'Profile picture' });
    expect(avatar).toHaveAttribute('src', '/pfp-default-header.png');
  });

  it('falls back to the default avatar when the photo fails to load', () => {
    renderHeader({ firstName: 'Gayatri', profilePic: 'https://example.com/broken.png' });
    const avatar = screen.getByRole('img', { name: "Gayatri's profile picture" });
    fireEvent.error(avatar);
    expect(avatar).toHaveAttribute('src', '/pfp-default-header.png');
  });
});
