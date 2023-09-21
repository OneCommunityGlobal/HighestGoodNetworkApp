import React from 'react';
import TeamsOverview from 'components/Teams/TeamsOverview';
import { renderWithProvider } from '__tests__/utils';

describe('TeamsOverview', () => {
  it('should render correctly', () => {
    renderWithProvider(<TeamsOverview />);
  });
});
