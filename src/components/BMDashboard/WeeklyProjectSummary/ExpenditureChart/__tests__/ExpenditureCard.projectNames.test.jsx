import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import axios from 'axios';
import ExpenditureCard from '../ExpenditureCard';
import { fetchBMProjects } from '../../../../../actions/bmdashboard/projectActions';

vi.mock('axios');

vi.mock('../../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: vi.fn(() => ({ type: 'FETCH_BM_PROJECTS' })),
}));

vi.mock('../ExpenditureChart', () => ({
  default: ({ projectId }) => <div>chart for {projectId}</div>,
}));

const BUILDING_3 = '654946c8bc5772e8caf7e963';
const UNNAMED = '654946c8bc5772e8caf7e999';

const renderCard = bmProjects => {
  axios.get.mockResolvedValue({ data: [BUILDING_3, UNNAMED] });
  const store = createMockStore([])({ theme: { darkMode: false }, bmProjects });
  return render(
    <Provider store={store}>
      <ExpenditureCard mode="stacked" pieType="planned" />
    </Provider>,
  );
};

describe('ExpenditureCard project dropdown', () => {
  beforeEach(() => vi.clearAllMocks());

  it('labels projects by name and falls back to a letter for unknown ids', async () => {
    renderCard([{ _id: BUILDING_3, name: 'Building 3' }]);

    expect(await screen.findByRole('option', { name: 'Building 3' })).toHaveValue(BUILDING_3);
    expect(screen.getByRole('option', { name: 'Project B' })).toHaveValue(UNNAMED);
    expect(screen.getByText(`chart for ${BUILDING_3}`)).toBeInTheDocument();
    expect(fetchBMProjects).not.toHaveBeenCalled();
  });

  it('loads the project list when it is not in the store yet', async () => {
    renderCard([]);

    expect(await screen.findByRole('option', { name: 'Project A' })).toBeInTheDocument();
    expect(fetchBMProjects).toHaveBeenCalled();
  });
});
