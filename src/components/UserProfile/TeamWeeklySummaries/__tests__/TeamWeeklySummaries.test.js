import React from 'react';
import { render, screen, fireEvent  } from '@testing-library/react';
import TeamWeeklySummaries from '../TeamWeeklySummaries';
import 'moment-timezone'; 
import moment from 'moment';



describe('Test Suite for Team Weekly Summaries component', () => {
  const testData = {
    name: 'John Doe',
    i: 0,
    data: {
      summary: '<p>This is a summary</p>',
    },
  };

  test('Test 1 : Renders component with empty data', () => {
    render(<TeamWeeklySummaries name="John Doe" i={0} data={{}} />);
    
    // component renders without crashing
    expect(screen.getByTestId('team-weekly-summaries')).toBeInTheDocument();
  });
  
  test('Test 2 : Assert the component handles missing or null summary', () => {
    render(<TeamWeeklySummaries name="John Doe" i={0} data={{ summary: null }} />);
    
    //  component renders without crashing
    expect(screen.getByTestId('team-weekly-summaries')).toBeInTheDocument();
  });
  
 
  test('Test 3 : Assert the  rendered date range matches the expected format', async () => {
    render(<TeamWeeklySummaries {...testData} />);
  const dateFormat = screen.getByText(/[\d]{2}-[A-Za-z]{3}-[\d]{2}/); // Regex pattern for date format
  const toWord = screen.getByText(/ to /);  // Check for the "to" separator

  expect(dateFormat).toBeInTheDocument();
  expect(toWord).toBeInTheDocument();
  });

  test('Test 4 : Displays the expected date range ', async () => {
    render(<TeamWeeklySummaries {...testData} />);
         const fromDate = moment().format('DD-MMM-YY');
      const toDate = moment().subtract(1, 'week').isoWeekday(7).format('DD-MMM-YY');
       /** This test uses the getByText query with a callback function. 
     * The function checks for an <h6> element with the specific class and 
     * ensures that both fromDate and toDate are present within its content.  */
      const dateRangeElement = screen.getByText((content, element) => {
      return (
        element.tagName.toLowerCase() === 'h6' &&
        element.classList.contains('team-weekly-header-date') &&
        content.includes(fromDate) &&
        content.includes(toDate)
      );
    });

    // assert that the  component renders the week dates correctly
    expect(dateRangeElement.textContent).toMatch(new RegExp(`${toDate}\\s+to\\s+${fromDate}`));

  });
  test('Test 5 : Assert if correct users summary is displayed ', async () => {
    render(<TeamWeeklySummaries {...testData} />);
    const summaryText = screen.getByText(/Viewing John Doe's summary/);
    expect(summaryText).toBeInTheDocument();

  });
  test('Test 6 : Assert presence of copy icon', async () => {
    render(<TeamWeeklySummaries {...testData} />);

    //Check if the copy icon is present
    const copyIcon = screen.getByTestId('copy-icon');
    expect(copyIcon).toBeInTheDocument();
  });


  test('Test 7 : Displays message for missing summary', () => {
    const testDataNoSummary = {
      name: 'Jane Smith',
      i: 1,
      data: {
        summary: '', // Empty summary indicates missing data
      },
    };

    render(<TeamWeeklySummaries {...testDataNoSummary} />);

    // Check if it displays the correct message for missing summary
    const missingSummaryText = screen.getByText(/Jane Smith did not submit a summary for this week./);
    expect(missingSummaryText).toBeInTheDocument();
  });



test('Test 8 : Assert the component renders with multiple summaries', () => {
  render(
    <div>
      <TeamWeeklySummaries name="John Doe" i={0} data={{ summary: '<p>This is John\'s summary</p>' }} />
      <TeamWeeklySummaries name="Jane Smith" i={1} data={{ summary: '<p>This is Jane\'s summary</p>' }} />
    </div>
  );
  
  // Check if both summaries are rendered
  expect(screen.getByText(/Viewing John Doe's summary/)).toBeInTheDocument();
  expect(screen.getByText(/Viewing Jane Smith's summary/)).toBeInTheDocument();
});

});


