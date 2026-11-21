import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import axios from 'axios';
import ExpenditureChart from '../ExpenditureChart';

vi.mock('axios');

const PROJECT_ID = '6823e200a3475f85a80d5d9c';
const store = createMockStore([])({ theme: { darkMode: false } });

const renderPie = pieType =>
  render(
    <Provider store={store}>
      <ExpenditureChart projectId={PROJECT_ID} pieType={pieType} />
    </Provider>,
  );

describe('ExpenditureChart planned pie without a budget', () => {
  beforeEach(() => vi.clearAllMocks());

  it('says no budget is set when the project has no budget', async () => {
    axios.get.mockResolvedValue({ data: { actual: [], planned: [], hasBudget: false } });
    renderPie('planned');
    expect(await screen.findByText('No budget set for this project')).toBeInTheDocument();
  });

  it('keeps the generic empty message for the actual pie', async () => {
    axios.get.mockResolvedValue({ data: { actual: [], planned: [], hasBudget: false } });
    renderPie('actual');
    expect(await screen.findByText('No expenditure data for this project')).toBeInTheDocument();
  });
});
