import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import mockSummaries from '../__mocks__/weeklySummariesReportData'; // Located in the tested component's __mocks__ folder
import FormattedReport from '../FormattedReport';

describe('FormattedReport Component', () => {
  it('Snapshot with mocked data', () => {
    //const { asFragment } = render(<FormattedReport summaries={mockSummaries} weekIndex="1" />);
    // expect(asFragment()).toMatchSnapshot();
  });
});
