import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import SocialMediaComposer from '../SocialMediaComposer';

vi.mock('axios');

const renderComposer = darkMode =>
  render(
    <Provider store={configureMockStore([])({ theme: { darkMode } })}>
      <SocialMediaComposer platform="mastodon" />
    </Provider>,
  );

describe('SocialMediaComposer styling', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
  });

  it('applies its CSS module classes to the sub-tabs', () => {
    renderComposer(false);
    const composerTab = screen.getByRole('button', { name: 'Composer' });
    expect(composerTab.className).toMatch(/tab-button/);
    expect(composerTab.className).toMatch(/active/);
    expect(screen.getByRole('button', { name: 'Scheduled' }).className).not.toMatch(/active/);
  });

  it('uses the dark style when the app is in dark mode', () => {
    renderComposer(true);
    expect(screen.getByTestId('social-media-composer').className).toMatch(/composer-dark/);
  });

  it('uses the light style when the app is not in dark mode', () => {
    renderComposer(false);
    expect(screen.getByTestId('social-media-composer').className).not.toMatch(/composer-dark/);
  });
});
