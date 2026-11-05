import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import axios from 'axios';
import VolunteeringTimeTab from '../VolunteeringTimeTab';
import { updateUserProfile } from '../../../../actions/userProfile';
import { ENDPOINTS } from '../../../../utils/URL';

vi.mock('axios');

const initialProfile = {
  _id: 'volunteer-fixture',
  firstName: 'Fixture',
  role: 'Core Team',
  createdDate: '2026-01-01',
  startDate: '2026-01-04',
  endDate: '',
  weeklycommittedHours: 20,
  missedHours: 2,
  totalIntangibleHrs: 4.25,
  hoursByCategory: { education: 8.5, society: 6 },
  weeklycommittedHoursHistory: [],
};

function Fixture({ canEdit = true, darkMode = false }) {
  const [profile, setProfile] = useState(initialProfile);
  const requestorRole = 'Administrator';
  const store = {
    getState: () => ({ theme: { darkMode } }),
    subscribe: () => () => {},
    dispatch: vi.fn(),
  };
  return (
    <Provider store={store}>
      <VolunteeringTimeTab
        userProfile={profile}
        setUserProfile={setProfile}
        role={requestorRole}
        canEdit={canEdit}
        canUpdateSummaryRequirements
        darkMode={darkMode}
        onStartDate={vi.fn()}
        onEndDate={vi.fn()}
      />
      <button type="button" onClick={() => updateUserProfile(profile)(store.dispatch)}>
        Save fixture
      </button>
    </Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockResolvedValue({ data: [] });
  axios.put.mockResolvedValue({ status: 200 });
});

describe('Profile hours scroll protection', () => {
  it.each([
    'Weekly Committed Hours',
    'Additional Make-up Hours This Week',
    'Total Intangible Hours',
    'Total Tangible Education Hours',
    'Total Tangible Society Hours',
  ])('blurs %s on wheel without cancelling page scrolling or changing hours', async placeholder => {
    render(<Fixture />);
    const input = screen.getByPlaceholderText(placeholder);
    const value = input.value;
    input.focus();
    expect(input).toHaveFocus();
    // jsdom does not implement native wheel stepping; Chromium covers that separately.
    expect(fireEvent.wheel(input, { deltaY: 120, cancelable: true })).toBe(true);
    expect(input).not.toHaveFocus();
    expect(input.value).toBe(value);
    fireEvent.click(screen.getByRole('button', { name: 'Save fixture' }));
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      ENDPOINTS.USER_PROFILE(initialProfile._id), initialProfile,
    ));
  });

  it.each([false, true])('saves the entered weekly hours for the target volunteer (dark=%s)', async darkMode => {
    render(<Fixture darkMode={darkMode} />);
    const input = screen.getByPlaceholderText('Weekly Committed Hours');
    fireEvent.change(input, { target: { value: '21' } });
    input.focus();
    fireEvent.wheel(input, { deltaY: -120 });
    fireEvent.click(screen.getByRole('button', { name: 'Save fixture' }));
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      ENDPOINTS.USER_PROFILE(initialProfile._id),
      { ...initialProfile, weeklycommittedHours: 21 },
    ));
  });

  it('preserves intentional decimal edits to intangible and category hours', async () => {
    render(<Fixture />);
    fireEvent.change(screen.getByPlaceholderText('Total Intangible Hours'), { target: { value: '4.75' } });
    fireEvent.change(screen.getByPlaceholderText('Total Tangible Education Hours'), { target: { value: '9.25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save fixture' }));
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      ENDPOINTS.USER_PROFILE(initialProfile._id),
      { ...initialProfile, totalIntangibleHrs: 4.75, hoursByCategory: { education: 9.25, society: 6 } },
    ));
  });

  it('keeps read-only hours non-editable', () => {
    render(<Fixture canEdit={false} />);
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
  });

  it.each([0, 168])('preserves the valid weekly-hours boundary %s when scrolling', async hours => {
    render(<Fixture />);
    const input = screen.getByPlaceholderText('Weekly Committed Hours');
    fireEvent.change(input, { target: { value: String(hours) } });
    input.focus();
    fireEvent.wheel(input, { deltaY: 120 });
    fireEvent.click(screen.getByRole('button', { name: 'Save fixture' }));
    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      ENDPOINTS.USER_PROFILE(initialProfile._id),
      { ...initialProfile, weeklycommittedHours: hours },
    ));
  });
});
