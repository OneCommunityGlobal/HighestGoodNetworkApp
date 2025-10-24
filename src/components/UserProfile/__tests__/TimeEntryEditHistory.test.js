import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeEntryEditHistory from '../TimeEntryEditHistory';
import * as reduxHooks from 'react-redux';
import { userProfileMock } from '../../../__tests__/mockStates';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import moment from 'moment-timezone';

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  useStore: jest.fn(),
}));


const mockDispatch = jest.fn();
const mockGetState = jest.fn();

const mockEditDate = moment();
userProfileMock.timeEntryEditHistory =[{
  date: mockEditDate,
  initialSeconds: 7380,
  newSeconds: 3780,
  _id: "65f115d2bbd8901dd437a737"
}]

const props = {
  userProfile:userProfileMock,
  setUserProfile:jest.fn(),  
}

const store = mockStore({
  role: {
    roles: [
      { roleName: 'User', permissions: ['deleteTimeEntry'] },
    ],
  },
  auth: {
    user: {
      role: 'Owner',
      permissions: { frontPermissions: ['deleteTimeEntry'] },
    },
  },
});


beforeEach(() => {
  jest.clearAllMocks();
  reduxHooks.useDispatch.mockReturnValue(mockDispatch);
  reduxHooks.useStore.mockReturnValue({ getState: mockGetState });

});

describe('UserProfileModal', () => {
  it('should render Time Entry Edit History Table', () => {
    render(<Provider store={store}> <TimeEntryEditHistory {...props} /> </Provider> );
    expect(screen.getByText(/Time Entry Edit History/i)).toBeInTheDocument();
  });
});

describe('UserProfileModal', () => {
  it('should render Delete Edit Button', () => {
    render(<Provider store={store}> <TimeEntryEditHistory {...props} /> </Provider> );
    const deleteEdit = screen.getByRole('button', { name: 'Delete Edit' });
    expect(deleteEdit).toBeInTheDocument();
  });
});

describe('UserProfileModal', () => {
  it('should call setUserProfle() after clicking Delete Edit button', () => {
    render(<Provider store={store}> <TimeEntryEditHistory {...props} /> </Provider> );
    const deleteEdit = screen.getByRole('button', { name: 'Delete Edit' });
    userEvent.click(deleteEdit);
    expect(props.setUserProfile).toHaveBeenCalled();
  });
});