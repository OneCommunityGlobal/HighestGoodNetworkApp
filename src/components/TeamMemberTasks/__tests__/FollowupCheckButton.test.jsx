import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import FollowupCheckButton from '../FollowupCheckButton';
import { setUserFollowUp } from '../../../actions/followUpActions';

vi.mock('../../../actions/followUpActions', () => ({
  setUserFollowUp: vi.fn(() => ({ type: 'TEST_SET_FOLLOWUP' })),
}));

const mockStore = configureMockStore([]);
const user = { personId: 'user-1' };

const renderButton = ({ hoursLogged, estimatedHours = 100, followUp } = {}) => {
  const task = { _id: 'task-1', hoursLogged, estimatedHours };
  const store = mockStore({
    userFollowUp: {
      followUps: followUp ? { 'user-1': [{ taskId: 'task-1', ...followUp }] } : {},
    },
  });
  const view = render(
    <Provider store={store}>
      <FollowupCheckButton mouseoverText="Check in with this person" user={user} task={task} />
    </Provider>,
  );
  return { ...view, store, checkbox: screen.getByRole('checkbox') };
};

const isRed = checkbox => checkbox.className.includes('team-task-progress-follow-up-red');

describe('FollowupCheckButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an unchecked green box under 50% with the tooltip text', () => {
    const { checkbox } = renderButton({ hoursLogged: 30 });
    expect(checkbox).not.toBeChecked();
    expect(isRed(checkbox)).toBe(false);
    expect(checkbox).toHaveAttribute('title', 'Check in with this person');
  });

  it('shows a red box over 50% when nobody has followed up', () => {
    const { checkbox } = renderButton({ hoursLogged: 60 });
    expect(checkbox).not.toBeChecked();
    expect(isRed(checkbox)).toBe(true);
  });

  it('shows a red box when the follow-up was unchecked over 50%', () => {
    const { checkbox } = renderButton({
      hoursLogged: 68.67,
      followUp: { followUpCheck: false, followUpPercentageDeadline: 60 },
    });
    expect(isRed(checkbox)).toBe(true);
  });

  it('shows a checked box with a check mark after a follow-up', () => {
    const { checkbox } = renderButton({
      hoursLogged: 60,
      followUp: { followUpCheck: true, followUpPercentageDeadline: 60, acceptedPercentage: 60 },
    });
    expect(checkbox).toBeChecked();
    expect(isRed(checkbox)).toBe(false);
    expect(screen.getByTitle('Accepted as complete')).toBeInTheDocument();
  });

  it('turns red again when more time is logged after a check over 90%', () => {
    const { checkbox } = renderButton({
      hoursLogged: 108,
      followUp: { followUpCheck: true, followUpPercentageDeadline: 95, acceptedPercentage: 95 },
    });
    expect(checkbox).not.toBeChecked();
    expect(isRed(checkbox)).toBe(true);
    expect(checkbox).toHaveAttribute(
      'title',
      '⚠️ Time was logged after this task was accepted as complete!',
    );
  });

  it('saves the follow-up with the accepted percentage when a red box is checked', () => {
    const { checkbox, store } = renderButton({
      hoursLogged: 80,
      followUp: { followUpCheck: true, followUpPercentageDeadline: 60, acceptedPercentage: 60 },
    });
    fireEvent.click(checkbox);
    expect(setUserFollowUp).toHaveBeenCalledWith('user-1', 'task-1', {
      followUpCheck: true,
      followUpPercentageDeadline: 80,
      acceptedPercentage: 80,
    });
    expect(store.getActions()).toEqual([{ type: 'TEST_SET_FOLLOWUP' }]);
  });

  it('clears the follow-up when a checked box is unchecked', () => {
    const { checkbox } = renderButton({
      hoursLogged: 60,
      followUp: { followUpCheck: true, followUpPercentageDeadline: 60, acceptedPercentage: 60 },
    });
    fireEvent.click(checkbox);
    expect(setUserFollowUp).toHaveBeenCalledWith('user-1', 'task-1', {
      followUpCheck: false,
      followUpPercentageDeadline: 60,
      acceptedPercentage: 0,
    });
  });
});
