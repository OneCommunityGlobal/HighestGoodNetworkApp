import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  authMock, userProfileMock, timeEntryMock, userProjectMock,
} from '../mockStates';
import { renderWithProvider, renderWithRouterMatch } from '../utils';

describe('user profile edit page', () => {
  beforeEach(() => {
    render(<div />);
  });
  it('should do nothing', () => {

  });
});
