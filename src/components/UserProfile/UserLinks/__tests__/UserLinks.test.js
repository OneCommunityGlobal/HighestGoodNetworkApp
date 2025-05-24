import React from 'react';
import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { userProfileMock, themeMock } from '../../../../__tests__/mockStates';
import { renderWithRouter } from '../../../../__tests__/utils';
import UserLinks from '../UserLinks';

const mockStore = configureMockStore();
const initialState = { theme: themeMock };
const store = mockStore(initialState);

const renderWithProviders = (ui, { store }) => {
  return renderWithRouter(
    <Provider store={store}>
      {ui}
    </Provider>
  );
};

describe('user links tests', () => {
  beforeEach(() => {
    renderWithProviders(<UserLinks links={userProfileMock.personalLinks} />, { store });
  });

  it('should render links', () => {
    expect(screen.getAllByRole('link')).toHaveLength(userProfileMock.personalLinks.length);
  });

  it('should render links with the correct href', () => {
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', `/${userProfileMock.personalLinks[0].Link}`);
  });
});
