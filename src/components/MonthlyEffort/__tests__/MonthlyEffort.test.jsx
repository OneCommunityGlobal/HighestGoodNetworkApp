import { render, screen } from '@testing-library/react';
import { MonthlyEffort } from '../MonthlyEffort';

describe('MonthlyEffort', () => {
  const props = {
    auth: { isAuthenticated: true, user: { userid: 'abcdef' } },
  };

  it('renders one <h5> heading with text "Monthly Efforts"', () => {
    render(<MonthlyEffort {...props} />);

    const headings = screen.getAllByRole('heading', { level: 5 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Monthly Efforts');
  });
});
