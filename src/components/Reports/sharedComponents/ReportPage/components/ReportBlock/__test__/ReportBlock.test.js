import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ReportBlock } from '../ReportBlock';

describe('ReportBlock component', () => {
  it('renders without crashing', () => {
    render(<ReportBlock />);
  });

  it('applies custom class names correctly', () => {
    const { container } = render(<ReportBlock className="custom-class" />);
    expect(container.firstChild).toHaveClass('report-block-wrapper custom-class');
  });

  it('renders with linear gradient when secondColor prop is provided', () => {
    const { container } = render(<ReportBlock firstColor="red" secondColor="blue" />);
    const blockContent = container.querySelector('.report-block-content');

    expect(blockContent).toHaveStyle('background: linear-gradient(to bottom right, red, blue)');
  });

  it('renders child components', () => {
    const { getByTestId } = render(
      <ReportBlock>
        <div data-testid="child-component">Child Component</div>
      </ReportBlock>
    );
    expect(getByTestId('child-component')).toBeInTheDocument();
  });
});
