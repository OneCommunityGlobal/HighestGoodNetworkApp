import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import UpdateToolModal, { TOOL_DETAIL_PLACEHOLDERS, getToolDetails } from '../UpdateToolModal';

vi.mock('axios');

const row = { _id: 'tool-a', itemType: { name: 'Drill' }, project: { name: 'Building 3' } };
const fetchedTool = {
  ...row,
  code: '001',
  itemType: { name: 'Drill', category: 'Power Tools' },
  condition: 'New',
  purchaseStatus: 'Rental',
};

const store = configureMockStore()({});
const renderModal = record =>
  render(
    <Provider store={store}>
      <UpdateToolModal modal setModal={() => {}} record={record} />
    </Provider>,
  );

const detail = label => screen.getByLabelText(label);

describe('getToolDetails', () => {
  it('uses mock values for fields the tool does not have yet', () => {
    expect(getToolDetails({ itemType: { name: 'Saw' } })).toEqual({
      ...TOOL_DETAIL_PLACEHOLDERS,
      name: 'Saw',
    });
    expect(getToolDetails(null)).toEqual(TOOL_DETAIL_PLACEHOLDERS);
  });
});

describe('UpdateToolModal tool details', () => {
  beforeEach(() => axios.get.mockReset());

  it('fetches the selected tool by its row ID and fills the details', async () => {
    axios.get.mockResolvedValueOnce({ data: fetchedTool });
    renderModal(row);

    expect(detail('Name')).toHaveValue('Loading…');
    expect(await screen.findByDisplayValue('Power Tools')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/bm/tools/tool-a'));
    expect(detail('Name')).toHaveValue('Drill');
    expect(detail('Number')).toHaveValue('001');
    expect(detail('Project')).toHaveValue('Building 3');
    expect(detail('Current Status')).toHaveValue('New');
    expect(detail('Ownership')).toHaveValue('Rental');
  });

  it('falls back to the row data and placeholders when the fetch fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));
    renderModal(row);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Couldn.t load/);
    expect(detail('Name')).toHaveValue('Drill');
    expect(detail('Project')).toHaveValue('Building 3');
    expect(detail('Class')).toHaveValue('General');
    expect(detail('Ownership')).toHaveValue('Team Alpha');
  });

  it('refetches when a different tool row is selected', async () => {
    axios.get
      .mockResolvedValueOnce({ data: fetchedTool })
      .mockResolvedValueOnce({ data: { _id: 'tool-b', itemType: { name: 'Ladder' } } });
    const view = renderModal(row);
    await screen.findByDisplayValue('Power Tools');

    view.rerender(
      <Provider store={store}>
        <UpdateToolModal modal setModal={() => {}} record={{ _id: 'tool-b' }} />
      </Provider>,
    );

    expect(await screen.findByDisplayValue('Ladder')).toBeInTheDocument();
    expect(axios.get).toHaveBeenLastCalledWith(expect.stringContaining('/bm/tools/tool-b'));
    expect(detail('Class')).toHaveValue('General');
  });
});
