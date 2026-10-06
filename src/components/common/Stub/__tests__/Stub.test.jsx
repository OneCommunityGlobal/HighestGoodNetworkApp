import { render, screen } from '@testing-library/react';
import Stub from '../Stub';

describe('Stub Component', () => {
  it('renders without crashing', () => {
    render(<Stub />);
    expect(screen.getByText("Nothing's here at the moment")).toBeInTheDocument();
  });

  it('contains the GiHollowCat icon', () => {
    render(<Stub />);
    expect(screen.getByTestId('stub-icon')).toBeInTheDocument();
  });

  it('renders GiHollowCat icon with correct size', () => {
    render(<Stub />);
    const icon = screen.getByTestId('stub-icon');
    expect(icon).toHaveAttribute('width', '72');
    expect(icon).toHaveAttribute('height', '72');
  });

  it('displays the correct text', () => {
    render(<Stub />);
    expect(screen.getByText("Nothing's here at the moment")).toBeInTheDocument();
  });

  it('has the correct class name for the wrapper', () => {
    render(<Stub />);
    expect(screen.getByTestId('stub-wrapper')).toBeInTheDocument();
  });
});
