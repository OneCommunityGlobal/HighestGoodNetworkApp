import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { fetchMessages } from '~/actions/lbdashboard/messagingActions';
import LBMessaging from '../LBMessaging';

const mocks = vi.hoisted(() => ({
  state: {},
  dispatch: vi.fn(() => Promise.resolve()),
  socket: { readyState: 1, send: vi.fn(), close: vi.fn() },
}));

vi.mock('react-redux', () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: selector => selector(mocks.state),
}));
vi.mock('../../../Header/Header', () => ({ default: () => null }));
vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('~/actions/userManagement', () => ({ getUserProfileBasicInfo: vi.fn() }));
vi.mock('~/actions/lbdashboard/userPreferenceActions', () => ({
  fetchUserPreferences: vi.fn(),
  updateUserPreferences: vi.fn(),
}));
vi.mock('~/actions/lbdashboard/messagingActions', () => ({
  fetchExistingChats: vi.fn(),
  fetchMessages: vi.fn(),
}));
vi.mock('../../../../utils/messagingSocket', () => ({
  initMessagingSocket: vi.fn(),
  getMessagingSocket: () => mocks.socket,
  updateChatState: vi.fn(),
  markMessagesAsReadViaSocket: vi.fn(),
}));

const contact = { userId: 'contact-1', firstName: 'Test', lastName: 'Contact' };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.state = {
    theme: { darkMode: false },
    auth: { user: { userid: 'current-user' } },
    allUserProfilesBasicInfo: { userProfilesBasicInfo: [{ _id: 'current-user' }] },
    messages: { existingChats: [contact], messages: [] },
  };
});

describe.each([false, true])('Messaging with darkMode=%s', darkMode => {
  it.each([390, 720, 1024])('keeps contacts selectable at width %i', async width => {
    window.innerWidth = width;
    mocks.state.theme.darkMode = darkMode;
    render(
      <MemoryRouter>
        <LBMessaging />
      </MemoryRouter>,
    );
    fireEvent(window, new Event('resize'));

    expect(screen.getByRole('heading', { name: 'Messages' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Test Contact/ }));

    expect(fetchMessages).toHaveBeenCalledWith('current-user', 'contact-1');
    expect(screen.getByPlaceholderText('Type a message...').disabled).toBe(false);
    // Resizing must not remove the contact panel or reset the chosen conversation.
    window.innerWidth = width === 390 ? 1024 : 390;
    fireEvent(window, new Event('resize'));
    expect(screen.getByRole('button', { name: /Test Contact/ })).toBeTruthy();
    expect(screen.getByPlaceholderText('Type a message...').disabled).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Search contacts' }));
    axios.get.mockResolvedValueOnce({
      data: [{ _id: 'found-user', firstName: 'Found', lastName: 'User' }],
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Search contacts' }), {
      target: { value: 'Found' },
    });
    fireEvent.click(await screen.findByRole('button', { name: /Found User/ }));
    expect(fetchMessages).toHaveBeenLastCalledWith('current-user', 'found-user');

    fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
      target: { value: 'Test message' },
    });
    fireEvent.keyDown(screen.getByPlaceholderText('Type a message...'), { key: 'Enter' });
    expect(mocks.socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        action: 'SEND_MESSAGE',
        receiver: 'found-user',
        content: 'Test message',
      }),
    );
  });
});
