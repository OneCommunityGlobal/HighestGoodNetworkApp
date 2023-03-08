import React from 'react';
import { shallow } from 'enzyme';
import { Header } from './Header';

describe('Header', () => {
  const auth = {
    isAuthenticated: true,
    user: {
      userid: 1,
      role: 'Owner',
      permissions: {
        frontPermissions: ['editTask', 'seeUserManagement', 'seeBadgeManagement']
      }
    }
  };
  const props = {
    auth: auth,
    getHeaderData: jest.fn(),
    getTimerData: jest.fn(),
    getAllRoles: jest.fn(),
    role: {
      roles: []
    }
  };
  const wrapper = shallow(<Header {...props} />);

  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
});