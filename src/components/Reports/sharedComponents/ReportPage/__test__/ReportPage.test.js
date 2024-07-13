import React from 'react';
import { render } from '@testing-library/react';
import { ReportPage } from '../ReportPage';

describe('ReportPage component', () => {
  it('renders without crashing', () => {
    render(<ReportPage renderProfile={() => null} />);
  });

  it('renders child components', () => {
    const { container } = render(
      <ReportPage renderProfile={() => null}>
        <ReportPage.ReportHeader />
        <ReportPage.ReportBlock />
        <ReportPage.ReportCard />
      </ReportPage>
    );

    expect(container.querySelector('.report-page-profile')).toBeInTheDocument();
    expect(container.querySelector('.report-page-content')).toBeInTheDocument();
    expect(container.querySelector('.report-header')).toBeInTheDocument();
    expect(container.querySelector('.report-block-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.report-card')).toBeInTheDocument();
  });

  it('passes props correctly', () => {
    const renderProfile = jest.fn();
    const contentClassName = 'custom-content-class';

    render(
      <ReportPage renderProfile={renderProfile} contentClassName={contentClassName}>
        <ReportPage.ReportHeader />
        <ReportPage.ReportBlock />
        <ReportPage.ReportCard />
      </ReportPage>
    );

    expect(renderProfile).toHaveBeenCalled();
    expect(document.querySelector('.report-page-content')).toHaveClass(contentClassName);
  });

});
