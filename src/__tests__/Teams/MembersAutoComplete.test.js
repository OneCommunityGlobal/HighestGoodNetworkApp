import React from 'react';
import MemberAutoComplete from 'components/Teams/MembersAutoComplete';
import { renderWithProvider } from '__tests__/utils';

describe('MembersAutoComplete', () => {
  it('render MembersAutoComplete component without errors', () => {
    renderWithProvider(<MemberAutoComplete />);
  });
});
