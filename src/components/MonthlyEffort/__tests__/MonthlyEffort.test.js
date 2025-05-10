import { render, screen } from '@testing-library/react';
import { MonthlyEffort } from '../MonthlyEffort';

describe('MonthlyEffort', () => {
  const props = {
    auth: { isAuthenticated: true, user: { userid: 'abcdef' } },
  };

  beforeEach(() => {
    render(<MonthlyEffort {...props} />);
  });

  it('renders one <h5> heading with text "Monthly Efforts"', () => {
    // <h5> elements are mapped to role="heading" level=5
    const headings = screen.getAllByRole('heading', { level: 5 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Monthly Efforts');
  });
});
