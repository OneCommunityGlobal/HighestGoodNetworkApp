import { render, screen } from '@testing-library/react';
import NumbersVolunteerWorked from '../NumbersVolunteerWorked';

let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
  container = null;
});

describe('NumbersVolunteerWorked component', () => {
  it('shows count, percentage and default range when totalVolunteers is provided', () => {
    render(
      <NumbersVolunteerWorked
        isLoading={false}
        data={{ count: 5 }}
        totalVolunteers={20}
        darkMode={false}
      />,
      { container },
    );
    expect(screen.getByText(/5 volunteers/i)).toBeInTheDocument();
    expect(screen.getByText(/25%/i)).toBeInTheDocument();
    expect(screen.getByText(/1\+ hours/i)).toBeInTheDocument();
  });

  it('accepts a custom rangeText prop for the label', () => {
    render(
      <NumbersVolunteerWorked
        isLoading={false}
        data={{ count: 2 }}
        totalVolunteers={2}
        rangeText="10-19.99 hrs"
      />,
      { container },
    );
    expect(screen.getByText(/2 volunteers/i)).toBeInTheDocument();
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
    expect(screen.getByText(/10-19.99 hrs/i)).toBeInTheDocument();
  });

  it('displays ellipsis when loading', () => {
    render(
      <NumbersVolunteerWorked isLoading={true} data={{ count: 100 }} totalVolunteers={500} />,
      { container },
    );
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
  });
});
