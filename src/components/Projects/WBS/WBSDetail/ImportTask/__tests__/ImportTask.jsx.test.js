import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ImportTask from '../ImportTask';
import { importTask, getPopupById } from '../../../../../../actions/task';
import { TASK_IMPORT_POPUP_ID } from '../../../../../../constants/popupId';

const mockStore = configureStore([]);
jest.mock('read-excel-file', () => jest.fn(() => Promise.resolve([])));
jest.mock('../../../../../../actions/task', () => ({
  importTask: jest.fn(() => ({ type: 'IMPORT_TASK' })),
  getPopupById: jest.fn(() => ({ type: 'GET_POPUP_BY_ID' })),
}));

describe('ImportTask Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      popupEditor: { currPopup: { popupContent: 'Task PR#905' } },
      projectMembers: { members: [] },
      theme: { darkMode: false },
    });
  });

  test('renders ImportTask component', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ImportTask />
      </Provider>
    );

    expect(getByText('Import Tasks')).toBeInTheDocument();
  });
});
