import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReportPage } from '../ReportPage';

describe('ReportPage component', () => {
  it('renders without crashing', () => {
    render(<ReportPage renderProfile={() => <div data-testid="profile" />} />);
    expect(screen.getByTestId('profile')).toBeInTheDocument();
  });

  it('renders child components', () => {
    render(
      <ReportPage renderProfile={() => <div data-testid="profile" />}>
        <div data-testid="header" className="report-header">
          Header
        </div>
        <div data-testid="block" className="report-block-wrapper">
          Block
        </div>
        <div data-testid="card" className="report-card">
          Card
        </div>
      </ReportPage>,
    );

    expect(screen.getByTestId('profile')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('block')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('passes props correctly', () => {
    const renderProfile = vi.fn(() => <div data-testid="profile" />);
    const contentClassName = 'custom-content-class';

    render(
      <ReportPage renderProfile={renderProfile} contentClassName={contentClassName}>
        <div>Test content</div>
      </ReportPage>,
    );

    expect(renderProfile).toHaveBeenCalled();
    expect(screen.getByTestId('report-content')).toHaveClass(contentClassName);
  });
});
