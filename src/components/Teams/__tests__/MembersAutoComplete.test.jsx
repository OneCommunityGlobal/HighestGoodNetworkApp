import React from 'react';
import { renderWithProvider } from '__tests__/utils';
import { screen, fireEvent } from '@testing-library/react';
import MemberAutoComplete from '~/components/Teams/MembersAutoComplete';

const mock = vi.fn();

const defaultProps = {
  searchText: '',
  setSearchText: mock,
  userProfileData: {
    userProfiles: [],
  },
  onAddUser: mock,
  existingMembers: [],
};

const dropdownProps = {
  searchText: 'Eduardo',
  setSearchText: mock,
  userProfileData: {
    userProfiles: [
      {
        isActive: true,
        firstName: 'Eduardo',
        lastName: 'ADM',
      },
    ],
  },
  onAddUser: mock,
  existingMembers: [],
};

describe('MembersAutoComplete', () => {
  it('should render MembersAutoComplete component without errors', () => {
    renderWithProvider(<MemberAutoComplete />);
  });

  it('should interacts with input field and calls setSearchText', () => {
    renderWithProvider(
      <MemberAutoComplete
        searchText={defaultProps.searchText}
        setSearchText={defaultProps.setSearchText}
        userProfileData={defaultProps.userProfileData}
        onAddUser={defaultProps.onAddUser}
        existingMembers={defaultProps.existingMembers}
      />,
    );

    const inputElement = screen.getByTestId('input-search');
    fireEvent.change(inputElement, { target: { value: 'Eduardo' } });

    expect(defaultProps.setSearchText).toHaveBeenCalledWith('Eduardo');
  });

  it('should dropdown appears when the input is filled', () => {
    renderWithProvider(
      <MemberAutoComplete
        searchText={dropdownProps.searchText}
        setSearchText={dropdownProps.setSearchText}
        userProfileData={dropdownProps.userProfileData}
        onAddUser={dropdownProps.onAddUser}
        existingMembers={dropdownProps.existingMembers}
      />,
    );

    const inputElement = screen.getByTestId('input-search');
    fireEvent.change(inputElement, { target: { value: 'Eduardo' } });

    const dropdownMenu = screen.queryByRole('menu');
    expect(dropdownMenu).toBeInTheDocument();
  });

  it('should call onAddUser with the correct user when a result is clicked', () => {
    const selectedUser = {
      isActive: true,
      firstName: 'Eduardo',
      lastName: 'ADM',
    };

    renderWithProvider(
      <MemberAutoComplete
        searchText={dropdownProps.searchText}
        setSearchText={dropdownProps.setSearchText}
        userProfileData={dropdownProps.userProfileData}
        onAddUser={dropdownProps.onAddUser}
        existingMembers={dropdownProps.existingMembers}
      />,
    );

    const inputElement = screen.getByTestId('input-search');
    fireEvent.change(inputElement, { target: { value: 'Eduardo' } });

    const userAutoCompleteElement = screen.getByText('Eduardo ADM');
    fireEvent.click(userAutoCompleteElement);

    expect(defaultProps.onAddUser).toHaveBeenCalledWith(selectedUser);
  });
});
