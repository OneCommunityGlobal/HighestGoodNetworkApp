import React from 'react';
import MemberAutoComplete from 'components/Teams/MembersAutoComplete';
import { renderWithProvider } from '__tests__/utils';
import { screen, fireEvent } from '@testing-library/react';

const mock = jest.fn();

const defaultProps = {
  searchText: '',
  setSearchText: mock,
  userProfileData: [],
  onAddUser: mock,
};

describe('MembersAutoComplete', () => {
  it('render MembersAutoComplete component without errors', () => {
    renderWithProvider(<MemberAutoComplete />);
  });

  it('interacts with input field and calls setSearchText', () => {
    renderWithProvider(<MemberAutoComplete {...defaultProps} />);

    const inputElement = screen.getByTestId('input-search');
    fireEvent.change(inputElement, { target: { value: 'Eduardo' } });

    expect(defaultProps.setSearchText).toHaveBeenCalledWith('Eduardo');
  });
});
