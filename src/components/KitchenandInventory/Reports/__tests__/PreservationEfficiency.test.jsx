import { render as renderUI, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import PreservationEfficiency from '../PreservationEfficiency';
import report from '../preservationReport.mock.json';
import KitchenHeader from '../../../KitchenInterfaces/KitchenHeader';

const render = (ui, darkMode = false) => {
  const store = createStore((state = { theme: { darkMode } }, action) =>
    action.type === 'toggleTheme' ? { theme: { darkMode: !state.theme.darkMode } } : state,
  );
  return { ...renderUI(<Provider store={store}>{ui}</Provider>), store };
};

describe('Preservation efficiency report', () => {
  it('renders mock metrics and sustainability details', () => {
    render(
      <MemoryRouter>
        <PreservationEfficiency />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Total Preserved' })).toBeInTheDocument();
    expect(screen.getByText('180 lbs')).toBeInTheDocument();
    expect(screen.getByText('Tomato Sauce')).toBeInTheDocument();
    expect(screen.getByText('6-12 months')).toBeInTheDocument();
    expect(screen.getByText('-22%')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'week' } });
    expect(screen.getByRole('combobox').value).toBe('week');
  });

  it('derives cards and achievement text from the supplied report', () => {
    render(
      <MemoryRouter>
        <PreservationEfficiency
          report={{ ...report, totalPreserved: 321, wasteSavedLbs: 90, efficiencyRate: 0.85 }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('321')).toBeInTheDocument();
    expect(
      screen.getByText('Preserved 321 items, preventing 90 lbs of food waste.'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('85%')).toHaveLength(2);
  });

  it('marks Reports active and supports the mobile menu', () => {
    render(
      <MemoryRouter initialEntries={['/kitchenandinventory/reports/preservation-efficiency']}>
        <KitchenHeader />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute('aria-current', 'page');
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
