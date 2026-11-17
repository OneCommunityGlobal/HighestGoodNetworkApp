import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import ProfileDetails from '../ProfileDetails';

const mockStore = configureMockStore([]);

// Note: socialHandles fields are given real values (rather than left empty)
// so that 'N/A' only ever appears for the field under test here - Slack and
// GitHub also legitimately fall back to 'N/A' elsewhere on the page, which
// would otherwise make a page-wide 'N/A' query ambiguous.
const baseProfileData = {
  userId: 'user-1',
  loggedInUserId: 'someone-else',
  teams: [],
  skillInfo: {
    general: {
      yearsOfExperience: 12,
    },
  },
  contactInfo: {
    email: 'test@example.com',
    phone: '555-1234',
  },
  socialHandles: {
    slack: '@testuser',
    github: 'https://github.com/testuser',
  },
};

const renderWithStore = profileData => {
  const store = mockStore({
    userSkills: { profileData },
    theme: { darkMode: false },
  });
  return render(
    <Provider store={store}>
      <ProfileDetails />
    </Provider>,
  );
};

describe('ProfileDetails - Years of Experience display', () => {
  it('renders a numeric years-of-experience value exactly once, not doubled', () => {
    renderWithStore(baseProfileData);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.queryByText('1212')).not.toBeInTheDocument();
  });

  it('renders "N/A" exactly once when no value is set, not doubled', () => {
    const profileData = {
      ...baseProfileData,
      skillInfo: { general: { yearsOfExperience: '' } },
    };
    renderWithStore(profileData);

    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.queryByText('N/AN/A')).not.toBeInTheDocument();
  });
});
