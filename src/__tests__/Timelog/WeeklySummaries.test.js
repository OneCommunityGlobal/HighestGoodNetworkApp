import React from 'react';
import { render, screen } from '@testing-library/react';
import parse from 'html-react-parser';
import WeeklySummaries from '../../components/Timelog/WeeklySummaries';

describe('WeeklySummaries Component', () => {
  it('renders no summaries message when there are no summaries', () => {
    const userProfile = { weeklySummaries: [] };
    render(<WeeklySummaries userProfile={userProfile} />);
    expect(screen.getByText('No weekly summaries available')).toBeInTheDocument();
  });

  it('displays summaries when they are present', () => {
    const userProfile = {
      weeklySummaries: [
        { summary: '<p>Summary of this week</p>' },
        { summary: '<p>Summary of last week</p>' },
        { summary: '<p>Summary of the week before last</p>' },
      ],
      firstName: 'John',
      lastName: 'Doe',
    };
    render(<WeeklySummaries userProfile={userProfile} />);
    expect(screen.getByText("This week's summary")).toBeInTheDocument();
    expect(screen.getByText("Last week's summary")).toBeInTheDocument();
    expect(screen.getByText("The week before last's summary")).toBeInTheDocument();

    // Directly check for the text content that is expected to be rendered
    expect(screen.getByText('Summary of this week')).toBeInTheDocument();
    expect(screen.getByText('Summary of last week')).toBeInTheDocument();
    expect(screen.getByText('Summary of the week before last')).toBeInTheDocument();
  });

  it('displays no submission message when summary is not present', () => {
    const userProfile = {
      weeklySummaries: [{ summary: null }, { summary: null }, { summary: null }],
      firstName: 'John',
      lastName: 'Doe',
    };
    render(<WeeklySummaries userProfile={userProfile} />);
    expect(
      screen.getAllByText(
        `${userProfile.firstName} ${userProfile.lastName} did not submit a summary.`,
      ).length,
    ).toBe(3);
  });
});
