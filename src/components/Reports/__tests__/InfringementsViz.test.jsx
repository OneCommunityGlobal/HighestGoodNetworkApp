import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import InfringementsViz from '../InfringementsViz';

describe('InfringementsViz component', () => {
  const mockInfringements = [
    {
      _id: '1',
      date: '2022-01-01',
      description: 'Test infringement 1',
    },
    {
      _id: '2',
      date: '2022-01-15',
      description: 'Test infringement 2',
    },
  ];

  it('renders without crashing', () => {
    render(<InfringementsViz infringements={[]} fromDate="" toDate="" />);
  });

  it('renders button to show graph', () => {
    render(<InfringementsViz infringements={[]} />);

    expect(screen.getByText('Show Infringements Graph')).toBeInTheDocument();
  });

  it('does not display the modal initially', () => {
    render(<InfringementsViz infringements={[]} fromDate="" toDate="" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the Recharts graph when expanded', () => {
    render(<InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />);

    fireEvent.click(screen.getByText('Show Infringements Graph'));

    expect(screen.getByText('Hide Infringements Graph')).toBeInTheDocument();
    expect(screen.getByTestId('infplot')).toBeInTheDocument();
  });

  it('shows an empty state when there are no infringements', () => {
    render(<InfringementsViz infringements={[]} fromDate="" toDate="" />);

    fireEvent.click(screen.getByText('Show Infringements Graph'));

    expect(screen.getByText('No infringements to display.')).toBeInTheDocument();
  });

  it('hides graph when button is clicked again', () => {
    render(<InfringementsViz infringements={mockInfringements} fromDate="" toDate="" />);

    fireEvent.click(screen.getByText('Show Infringements Graph'));
    fireEvent.click(screen.getByText('Hide Infringements Graph'));

    expect(screen.getByText('Show Infringements Graph')).toBeInTheDocument();
    expect(screen.queryByTestId('infplot')).not.toBeInTheDocument();
  });
});
