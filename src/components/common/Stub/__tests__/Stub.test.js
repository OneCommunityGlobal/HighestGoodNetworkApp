import { render, screen } from '@testing-library/react';
import { Stub } from '../Stub';

describe('Stub Component', () => {
  it('renders without crashing', () => {
    render(<Stub />);
    expect(screen.getByText("Nothing's here at the moment")).toBeInTheDocument();
  });

  it('contains the GiHollowCat icon', () => {
    render(<Stub />);
    const icon = document.querySelector('svg'); // Directly select the svg element
    expect(icon).toBeInTheDocument();
  });

  it('renders GiHollowCat icon with correct size', () => {
    render(<Stub />);
    const icon = document.querySelector('svg');
    expect(icon).toHaveAttribute('width', '72');
    expect(icon).toHaveAttribute('height', '72');
  });

  it('displays the correct text', () => {
    render(<Stub />);
    expect(screen.getByText("Nothing's here at the moment")).toBeInTheDocument();
  });

  it('has the correct class name for the wrapper', () => {
    render(<Stub />);
    const wrapper = document.querySelector('.stub-wrapper'); // Use querySelector to check for class
    expect(wrapper).toBeInTheDocument();
  });
});