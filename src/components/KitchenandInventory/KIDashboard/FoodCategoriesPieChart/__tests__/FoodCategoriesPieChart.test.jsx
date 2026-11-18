import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import FoodCategoriesPieChart from '../FoodCategoriesPieChart';

vi.mock('recharts', () => import('../../testUtils/rechartsPieMock'));

const renderChart = (darkMode = false) =>
  render(
    <Provider store={configureMockStore([])({ theme: { darkMode } })}>
      <FoodCategoriesPieChart />
    </Provider>,
  );

describe('Food Categories chart', () => {
  it('shows the four categories by current inventory by default', () => {
    renderChart();
    expect(
      screen.getByRole('heading', { name: 'Food Categories by Current Inventory' }),
    ).toBeInTheDocument();
    ['Fresh Produce', 'Grains', 'Proteins', 'Dairy'].forEach(name =>
      expect(screen.getByTestId('pie-slices')).toHaveTextContent(name),
    );
    expect(screen.getByTestId('tooltip')).toHaveTextContent('1,200 kg');
  });

  it('switches to money spent and resets back', () => {
    renderChart();
    const reset = screen.getByRole('button', { name: 'Reset Filters' });
    expect(reset).toBeDisabled();

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'spent' } });
    expect(
      screen.getByRole('heading', { name: 'Food Categories by Money Spent' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveTextContent('$1,200');

    fireEvent.click(reset);
    expect(
      screen.getByRole('heading', { name: 'Food Categories by Current Inventory' }),
    ).toBeInTheDocument();
  });

  it('changes the slices for one kitchen', () => {
    renderChart();
    const allSlices = screen.getByTestId('pie-slices').textContent;
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'Kitchen 3' } });
    expect(screen.getByTestId('pie-slices').textContent).not.toBe(allSlices);
  });

  it('shows an error and no chart when From is after To', () => {
    renderChart(true);
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-06-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-02-01' } });
    expect(screen.getByText('From date must be before or equal to To date.')).toBeInTheDocument();
    expect(screen.getByText('No data available for the selected filters.')).toBeInTheDocument();
  });
});
