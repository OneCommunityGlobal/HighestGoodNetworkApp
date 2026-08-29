// src/components/Projects/WBS/WBSDetail/ImportTask/__tests__/ImportTask.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import readXlsxFile from 'read-excel-file';
import * as taskActions from '../../../../../../actions/task';
import ImportTask from '../ImportTask';
import { Provider } from 'react-redux';
import * as popupActions from '../../../../../../actions/popupEditorAction';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

vi.mock('read-excel-file');

// Stub importTask so it never errors
vi.spyOn(taskActions, 'importTask').mockImplementation(() => () => Promise.resolve());
// Stub getPopupById to resolve immediately so the async toggle can proceed
vi.spyOn(popupActions, 'getPopupById').mockImplementation(() => () => Promise.resolve());

// Minimal reducers to satisfy mapStateToProps
const initialState = {
  popupEditor:    { currPopup: { popupContent: '<p>Initial instruction</p>' } },
  projectMembers: { members: [{ firstName: 'John', lastName: 'Doe', _id: '1', profilePic: null }] },
  theme:          { darkMode: false },
};
const rootReducer = combineReducers({
  popupEditor:    (s = initialState.popupEditor)    => s,
  projectMembers: (s = initialState.projectMembers) => s,
  theme:          (s = initialState.theme)          => s,
});
const store = createStore(rootReducer, applyMiddleware(thunk));

// Mock props not from Redux
const loadMock         = vi.fn();
const setIsLoadingMock = vi.fn();

// Helper to render the connected component under a Provider
const renderComponent = () =>
  render(
    <Provider store={store}>
      <ImportTask
        wbsId={42}
        load={loadMock}
        setIsLoading={setIsLoadingMock}
      />
    </Provider>
  );

  async function openModalAndGetFileInput() {
    fireEvent.click(screen.getByRole('button', { name: /import tasks/i }));
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      // file <input id="file" /> lives in the portal
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      if (!dialog.querySelector('input#file')) throw new Error('file input not ready');
    });
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const fileInput = dialog.querySelector('input#file');
    return { dialog, fileInput };
  }
  

describe('ImportTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply stubs after clearAllMocks()
    vi.spyOn(taskActions, 'importTask').mockImplementation(() => () => Promise.resolve());
    vi.spyOn(popupActions, 'getPopupById').mockImplementation(() => () => Promise.resolve());
  });

  it('renders the Import Tasks button and modal is closed initially', () => {
    const { container } = renderComponent();
    expect(
      screen.getByRole('button', { name: /import tasks/i })
    ).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('.modal')).toBeNull();
  });

  it('opens the modal when the button is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /import tasks/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('uploads a valid file and shows success', async () => {
    readXlsxFile.mockResolvedValue([['H'], [], ['row']]);

    renderComponent();
    const { dialog, fileInput } = await openModalAndGetFileInput();
    fireEvent.change(fileInput, {
      target: { files: [ new File([], 'tasks.xlsx') ] }
    });

    // wait for the Upload button to appear, then click it
    const uploadBtn = await screen.findByRole('button', { name: /upload/i });
    fireEvent.click(uploadBtn);

    // finally, "File Uploaded!" should be visible
    await screen.findByText(/file uploaded!/i);
  });

  it('resets back to file chooser when Reset is clicked', async () => {
    readXlsxFile.mockResolvedValue([['H'], [], ['row']]);

    renderComponent();
    const { dialog, fileInput } = await openModalAndGetFileInput();
    fireEvent.change(fileInput, { target: { files: [ new File([], 'a.xlsx') ] } });

    // wait for Reset button, then click it
    const resetBtn = await screen.findByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(dialog.querySelector('input#file')).toBeInTheDocument();
    expect(
      screen.queryByText(/are you sure you want to upload it\?/i)
    ).toBeNull();
  });

  it('shows an uploading spinner when importTask never resolves', async () => {
    readXlsxFile.mockResolvedValue([['H'], [], ['row']]);
    taskActions.importTask.mockImplementation(() => () => new Promise(() => {}));

    renderComponent();
    const { dialog, fileInput } = await openModalAndGetFileInput();
    fireEvent.change(fileInput, { target: { files: [ new File([], 'b.xlsx') ] } });

    // click Upload once it appears
    const uploadBtn = await screen.findByRole('button', { name: /upload/i });
    fireEvent.click(uploadBtn);

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(document.querySelector('.spinner-grow')).toBeInTheDocument();
  });

  it('shows an error if a member in the sheet is not found', async () => {
    const badRows = [
      ['H'], [],
      ['1','T', null,null,null,null,null,null,'P2','Jane Smith','Yes','Open','1','2','3','4']
    ];
    readXlsxFile.mockResolvedValue(badRows);

    renderComponent();
    const { dialog, fileInput } = await openModalAndGetFileInput();
    fireEvent.change(fileInput, { target: { files: [ new File([], 'bad.xlsx') ] } });

    expect(
      await screen.findByText(/jane smith is not in the project member list/i)
    ).toBeInTheDocument();
  });
});