import { render, fireEvent, screen } from '@testing-library/react';
import { WeeklySummaryContentTooltip, MediaURLTooltip } from '../WeeklySummaryTooltips'; // Adjust the import path as needed

describe('WeeklySummaryContentTooltip Component Tests', () => {
  it('renders without crashing', () => {
    render(<WeeklySummaryContentTooltip tabId="testId" />);
    expect(screen.getByTestId('summary-content-tooltip-testId')).toBeInTheDocument();
  });

  it('toggles tooltip on icon click', () => {
    render(<WeeklySummaryContentTooltip tabId="testId" />);
    const icon = screen.getByTestId('summary-content-tooltip-icon');
    fireEvent.mouseOver(icon);
  });
});

describe('MediaURLTooltip Component Tests', () => {
  it('renders without crashing', () => {
    render(<MediaURLTooltip />);
    expect(screen.getByTestId('mediaurl-tooltip')).toBeInTheDocument();
  });

  it('toggles tooltip on icon click', () => {
    render(<MediaURLTooltip />);
    const icon = screen.getByTestId('mediaurl-tooltip-icon');
    fireEvent.mouseOver(icon);
  });
});
