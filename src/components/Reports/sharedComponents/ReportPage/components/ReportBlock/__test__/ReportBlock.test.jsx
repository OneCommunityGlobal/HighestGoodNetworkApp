import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ReportBlock } from '../ReportBlock';

describe('ReportBlock component', () => {
  it('renders without crashing', () => {
    render(<ReportBlock />);
    expect(screen.getByTestId('report-block-wrapper')).toBeInTheDocument();
  });

  it('applies custom class names correctly', () => {
    render(<ReportBlock className="custom-class" />);
    const wrapper = screen.getByTestId('report-block-wrapper');
    expect(wrapper).toHaveClass('custom-class');
    // Check that it has a CSS module class (the exact name will be hashed)
    expect(wrapper.className).toMatch(/_.*custom-class/);
  });

  it('renders with linear gradient when secondColor prop is provided', () => {
    render(<ReportBlock firstColor="red" secondColor="blue" />);
    const gradientBlock = screen.getByTestId('report-block-content');
    expect(gradientBlock).toHaveStyle('background: linear-gradient(to bottom right, red, blue)');
  });

  it('renders child components', () => {
    render(
      <ReportBlock>
        <div data-testid="child-component">Child Component</div>
      </ReportBlock>
    );
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });
});