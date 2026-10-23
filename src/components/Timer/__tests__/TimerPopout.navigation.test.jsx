import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Router, useHistory, useLocation } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import TimerPopout from '../TimerPopout';
import DuplicateTimeLogModal from '../../Timelog/TimeEntryForm/DuplicateTimeLogModal';

vi.mock('react-redux', () => ({
  Provider: ({ children }) => children,
}));

function MainLocation() {
  const location = useLocation();
  return <output data-testid="main-location">{`${location.pathname}${location.hash}`}</output>;
}

function HeaderWithTimer({ history }) {
  const location = useLocation();
  const isCommunityPortal = location.pathname.startsWith('/communityportal');
  return (
    <div data-testid={isCommunityPortal ? 'community-header' : 'timelog-header'}>
      <TimerPopout
        key={isCommunityPortal ? 'community-timer-owner' : 'timelog-timer-owner'}
        authUser={{ userid: 'user-123' }}
        darkMode={false}
        history={history}
        TimerComponent={PopupTimer}
      />
    </div>
  );
}

function PopupTimer() {
  const sharedHistory = useHistory();
  const [isOpen, setIsOpen] = useState(true);
  const [elapsed] = useState('00:12:34');
  return (
    <>
      <output data-testid="popup-elapsed">{elapsed}</output>
      <DuplicateTimeLogModal
        isOpen={isOpen}
        onCancel={() => {
          setIsOpen(false);
          sharedHistory.push('/timelog/user-123#currentWeek');
        }}
        onEdit={() => setIsOpen(false)}
        onProceed={() => {}}
      />
    </>
  );
}

describe('TimerPopout shared navigation history', () => {
  let frame;
  let popupWindow;
  let history;

  beforeEach(() => {
    frame = document.createElement('iframe');
    document.body.appendChild(frame);
    popupWindow = frame.contentWindow;
    vi.spyOn(popupWindow, 'close').mockImplementation(() => frame.remove());
    vi.spyOn(window, 'open').mockReturnValue(popupWindow);
    history = createMemoryHistory({ initialEntries: ['/communityportal'] });
  });

  afterEach(() => {
    if (popupWindow?.onbeforeunload) {
      act(() => popupWindow.onbeforeunload());
    }
    frame?.remove();
    vi.restoreAllMocks();
  });

  it('navigates the main app from the popout and keeps the popup timer alive when its header unmounts', async () => {
    render(
      <Router history={history}>
        <MainLocation />
        <HeaderWithTimer history={history} />
      </Router>,
    );

    await userEventOpenPopup();
    const popupQueries = within(popupWindow.document);
    await waitFor(() =>
      expect(popupQueries.getByTestId('popup-elapsed')).toHaveTextContent('00:12:34'),
    );
    await userEventOpenCancelInPopup();

    expect(screen.getByTestId('main-location')).toHaveTextContent('/timelog/user-123#currentWeek');
    expect(screen.getByTestId('timelog-header')).toBeInTheDocument();
    expect(popupWindow.close).not.toHaveBeenCalled();
    expect(popupQueries.getByTestId('popup-elapsed')).toHaveTextContent('00:12:34');
  });

  it('closes the popup when the main app unmounts and no Timer owner remains', async () => {
    const { unmount } = render(
      <Router history={history}>
        <HeaderWithTimer history={history} />
      </Router>,
    );
    await userEventOpenPopup();

    unmount();

    await waitFor(() => expect(popupWindow.close).toHaveBeenCalled());
  });

  async function userEventOpenPopup() {
    fireEvent.click(screen.getByRole('button', { name: /open timer in new window/i }));
    await waitFor(() => expect(window.open).toHaveBeenCalledTimes(1));
  }

  async function userEventOpenCancelInPopup() {
    await userEventFindAndClickCancel();
  }

  async function userEventFindAndClickCancel() {
    const cancelButton = await screen.findByRole('button', {
      name: 'CANCEL — I don’t want duplicates',
    });
    fireEvent.click(cancelButton);
  }
});
