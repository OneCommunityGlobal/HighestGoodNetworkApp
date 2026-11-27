import React from 'react';
import { render, screen } from '@testing-library/react';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { ModalProvider } from '~/context/ModalContext';
import PermissionList from '../PermissionList';
import permissionLabel from '../PermissionsConst';

// Stand-in for the blue info icon: it only shows the name its text is saved under
vi.mock('../../UserProfile/EditableModal/EditableInfoModal', () => ({
  default: ({ areaName }) => <span data-testid="info-text-name">{areaName}</span>,
}));

const mockStore = configureMockStore([thunk]);

const makeStore = () =>
  mockStore({
    auth: {
      user: { role: 'Owner', permissions: { frontPermissions: [], backPermissions: [] } },
    },
    role: { roles: [] },
    theme: { darkMode: false },
    infoCollections: { infos: [] },
  });

// headings at every level, nested ones included
const countHeadings = list =>
  list.reduce(
    (count, item) => (item.subperms ? count + 1 + countHeadings(item.subperms) : count),
    0,
  );

// the values that appear more than once
const findRepeats = values => values.filter((value, index) => values.indexOf(value) !== index);

describe('Names in the real permission list (Permissions.json)', () => {
  it('gives every heading its own saved info text name', () => {
    render(
      <Provider store={makeStore()}>
        <ModalProvider>
          <PermissionList permissionsList={permissionLabel} />
        </ModalProvider>
      </Provider>,
    );

    // a heading saves under its lower-case label, so 'Tasks' and 'TASKS' would share one text
    const headingNames = screen
      .getAllByTestId('info-text-name')
      .map(icon => icon.textContent)
      .filter(name => name.startsWith('Permission Heading: '));

    expect(headingNames).toHaveLength(countHeadings(permissionLabel));
    expect(findRepeats(headingNames)).toEqual([]);
  });
});
