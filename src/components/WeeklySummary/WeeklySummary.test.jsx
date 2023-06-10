/* eslint-disable no-undef */
import React from 'react';
import moment from 'moment';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { weeklySummaryMockData1 } from 'weeklySummaryMockData'; // Located in the tested component's __mocks__ folder
import { WeeklySummary } from './WeeklySummary';
import { CountdownTimer } from './CountdownTimer';

describe('WeeklySummary page', () => {
  describe('On page load', () => {
    it('displays loading indicator', () => {
      const props = {
        currentUser: { userid: '1' },
        getWeeklySummaries: jest.fn(),
        updateWeeklySummaries: jest.fn(),
        loading: true,
        summaries: weeklySummaryMockData1,
        authUser: {role:''},
        roles: [],
      };

      render(<WeeklySummary {...props} />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
    it('displays an error message if there is an error on data fetch', async () => {
      const props = {
        currentUser: { userid: '1' },
        getWeeklySummaries: jest.fn(),
        updateWeeklySummaries: jest.fn(),
        fetchError: { message: 'SOME ERROR CONNECTING!!!' },
        loading: false,
        summaries: weeklySummaryMockData1,
        authUser: {role:''},
        roles: [],
      };
      render(<WeeklySummary {...props} />);

      await waitFor(() => screen.getByTestId('loading'));

      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });

  describe('Tabs display', () => {
    let props = {
      currentUser: { userid: '1' },
      getWeeklySummaries: jest.fn(),
      updateWeeklySummaries: jest.fn(),
      loading: false,
      summaries: weeklySummaryMockData1,
      authUser: {role:''},
      roles: [],
    };

    beforeEach(() => {
      render(<WeeklySummary {...props} />);
    });

    it('should display 4 tabs even when the user summaries related fields have not been initialized in the database', () => {
      props = {
        currentUser: { userid: '1' },
        getWeeklySummaries: jest.fn(),
        updateWeeklySummaries: jest.fn(),
        loading: false,
        summaries: {},
        authUser: {role:''},
        roles: [],
      };

      render(<WeeklySummary {...props} />);

      const li = screen.getAllByRole('listitem');
      expect(li.length).toEqual(4);
    });

    it('should have 4 tab', () => {
      const li = screen.getAllByRole('listitem');
      expect(li.length).toEqual(4);
    });

    it('should have first tab set to "active" by default', () => {
      expect(screen.getByTestId('tab-1').classList.contains('active')).toBe(true);
    });

    it('should make 1st tab active when clicked', () => {
      // First tab click.
      userEvent.click(screen.getByTestId('tab-1'));
      expect(screen.getByTestId('tab-1').classList.contains('active')).toBe(true);
    });
    it('should make 2nd tab active when clicked', () => {
      // Second tab click.
      userEvent.click(screen.getByTestId('tab-2'));
      expect(screen.getByTestId('tab-2').classList.contains('active')).toBe(true);
    });
    it('should make 3rd tab active when clicked', () => {
      // Third tab click.
      userEvent.click(screen.getByTestId('tab-3'));
      expect(screen.getByTestId('tab-3').classList.contains('active')).toBe(true);
    });
    it('should make 4th tab active when clicked', () => {
      // Fourth tab click.
      userEvent.click(screen.getByTestId('tab-4'));
      expect(screen.getByTestId('tab-4').classList.contains('active')).toBe(true);
    });
  });

  /**
   * The "CountdownTimer" component needs to be tested in isolation because it would be
   * hard to do it through the main "WeeklySummary" component.
   */
  describe('Due Date and Time Countdown Indicator', () => {
    it('displays "Time\'s Up" message at week\'s end', async () => {
      // Set the dueDate to the current time -1 second to simulate as if the week had just ended.
      const dueDate = moment().subtract(1, 'seconds');
      render(<CountdownTimer date={dueDate} />);

      await waitFor(() => screen.getByText("Time's up!"));

      expect(screen.getByText(/^time's up!$/i)).toBeInTheDocument();
    });
  });

  describe('Tooltips', () => {
    const props = {
      currentUser: { userid: '1' },
      getWeeklySummaries: jest.fn(),
      updateWeeklySummaries: jest.fn(),
      loading: false,
      summaries: weeklySummaryMockData1,
      authUser: {role:''},
      roles: [],
    };

    beforeEach(() => {
      render(<WeeklySummary {...props} />);
    });

    const testTooltip = async (testId) => {
      const tooltipIcon = await waitFor(() => screen.getByTestId(testId));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      userEvent.hover(tooltipIcon);
      const tooltip = await waitFor(() => screen.getByRole('tooltip'));
      expect(tooltip).toBeInTheDocument();
    };

    describe('Tabs content tooltip', () => {
      it('opens on mouse over (hover)', async () => {
        await testTooltip('summary-content-tooltip-1');
      });
    });

    describe('Media URL tooltip', () => {
      it('opens on mouse over (hover)', async () => {
        await testTooltip('mediaurl-tooltip');
      });
    });
  });

  describe('Form Elements', () => {
    let props = {
      currentUser: { userid: '1' },
      getWeeklySummaries: jest.fn(),
      updateWeeklySummaries: jest.fn(),
      loading: false,
      summaries: {},
      authUser: {role:''},
      roles: [],
    };

    beforeEach(() => {
      render(<WeeklySummary {...props} />);
    });

    describe('Media URL field', () => {
      it('should handle input change', async () => {
        const labelText = screen.getByLabelText(/Link to your media files/i);
        await userEvent.type(labelText, 'h');
        expect(labelText).toHaveAttribute('value', 'h');
      });
      it('should display an error message on invalid URL and remove the error message when the user types in a valid URL', async () => {
        const labelText = screen.getByLabelText(/Link to your media files/i);
        await userEvent.type(labelText, 'h');
        expect(labelText).toHaveAttribute('value', 'h');
        // Display and error message.
        const mediaUrlError = screen.getByText(/"Media URL" must be a valid uri/i);
        expect(mediaUrlError).toBeInTheDocument();
        // Remove the error message when the URL is valid.
        await userEvent.type(labelText, 'https://www.example.com/');
        expect(mediaUrlError).not.toBeInTheDocument();
      });
    });

    describe('Confirmation checkbox for media files', () => {
      it('should be unchecked by default and can be checked', () => {
        const checkbox = screen.getByLabelText(
          "I have provided a minimum of 4 screenshots (6-10 preferred) of this week's work. (required)",
        );
        expect(checkbox).not.toBeChecked();
        userEvent.click(checkbox);
        expect(checkbox).toBeChecked();
      });
      it('should display an error message if the checkbox is unchecked after it was checked first', () => {
        const checkbox = screen.getByLabelText(
          "I have provided a minimum of 4 screenshots (6-10 preferred) of this week's work. (required)",
        );
        expect(checkbox).not.toBeChecked();
        userEvent.click(checkbox);
        expect(checkbox).toBeChecked();
        userEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
        const mediaConfirmError = screen.getByText(
          /Please confirm that you have provided the required media files./i,
        );
        expect(mediaConfirmError).toBeInTheDocument();
      });
    });

    describe('Handle save', () => {
      props = {
        ...props,
        updateWeeklySummaries: jest.fn().mockReturnValueOnce(200),
      };

      it('should save the form data when "Save" button is pressed', async () => {
        const saveButton = screen.getByRole('button', { name: /save/i });
        expect(saveButton).toBeDisabled();
        // Enable the button
        // provide media URL
        const labelText = screen.getByLabelText(/Link to your media files/i);
        await userEvent.type(labelText, 'https://www.example.com/');
        // check off the media URL concent checkbox
        const checkbox = screen.getByLabelText(
          "I have provided a minimum of 4 screenshots (6-10 preferred) of this week's work. (required)",
        );
        userEvent.click(checkbox);

        expect(saveButton).toBeEnabled();

        userEvent.click(saveButton);
      });
    });
  });
});
