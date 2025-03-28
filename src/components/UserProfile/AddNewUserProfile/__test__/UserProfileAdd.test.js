import React from 'react';
import { mount } from 'enzyme';
import AddUserProfile from '../UserProfileAdd';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  authMock,
  rolesMock,
  userProfileMock,
  allProjectsMock,
} from '../../../../__tests__/mockStates.js';

import axios from 'axios';
jest.mock('axios');

describe('AddUserProfile page structure', () => {
  let mountedUserProfileAdd, instance;
  beforeEach(() => {
    const initialState = {
      auth: authMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      allProjects: allProjectsMock,
      theme: { darkMode: false },
    };

    const mockStore = configureMockStore([thunk]);
    const store = mockStore(initialState);

    axios.get.mockResolvedValue({
      status: 200,
    });

    mountedUserProfileAdd = mount(
      <Provider store={store}>
        <MemoryRouter>
          {' '}
          {/* Use MemoryRouter for testing */}
          <AddUserProfile />
        </MemoryRouter>
      </Provider>,
    );
    instance = mountedUserProfileAdd
      .find(AddUserProfile)
      .children()
      .first()
      .instance();
  });

  it('should be rendered with 13 input fields', () => {
    const inputs = mountedUserProfileAdd.find('Input');
    expect(inputs.length).toBe(12);
  });

  it('should be rendered with 6 button', () => {
    const button = mountedUserProfileAdd.find('Button');
    expect(button.length).toBe(5);
  });

  it('should correctly update the input value in the state', () => {
    const expectedEmail = 'unittest@hgn.com';
    const mockEvent = { target: { value: expectedEmail, id: 'email' } };
    instance.handleUserProfile(mockEvent);
    expect(instance.state.userProfile.email).toEqual(expectedEmail);
  });

  it('should correctly update the error message in the state if input field is empty', () => {
    const firstname = '';
    const mockEvent = { target: { value: firstname, id: 'firstName' } };
    instance.handleUserProfile(mockEvent);
    expect(instance.state.formErrors.firstName).toEqual('First Name required');
  });

  it('should call createUserProfile when create button is clicked', () => {
    const createButton = mountedUserProfileAdd.find({ 'data-testid': 'create-userProfile' });
    const spy = jest.spyOn(
      mountedUserProfileAdd
        .find(AddUserProfile)
        .children()
        .first()
        .instance(),
      'createUserProfile',
    );
    createButton.at(1).simulate('click');
    expect(spy).toHaveBeenCalled();
  });

  it('should call handleUserProfile when input is changed', () => {
    const expectedEmail = 'unittest@hgn.com';
    mountedUserProfileAdd.update();
    const email = mountedUserProfileAdd.find("[name='email']");
    email.at(1).simulate('change', { target: { value: expectedEmail, id: 'email' } });
    expect(instance.state.userProfile.email).toEqual(expectedEmail);
  });
});
