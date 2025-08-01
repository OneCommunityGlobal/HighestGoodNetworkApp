/* eslint-disable testing-library/no-render-in-lifecycle */
import React from 'react';
import moment from 'moment';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { default as configureStore } from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
import { Provider } from 'react-redux';
import { weeklySummaryMockData1 } from '../__mocks__/weeklySummaryMockData'; // Located in the tested component's __mocks__ folder
import { WeeklySummary } from '../WeeklySummary';
import CountdownTimer from '../CountdownTimer';

import CurrentPromptModal from '../CurrentPromptModal';

vi.mock('../CurrentPromptModal', () => ({
  __esModule: true,
  default: () => <div data-testid="current-prompt-modal">Mocked Prompt Modal</div>,
}));
const wrapper = props => render(<CurrentPromptModal {...props} />);

vi.mock('react-toastify', () => {
  const toast = vi.fn();
  toast.success = vi.fn();
  toast.error = vi.fn();

  return {
    toast,
    ToastContainer: () => <div data-testid="toast-container" />,
  };
});

const mockStore = configureStore([]);

describe('WeeklySummary page', () => {
  describe('On page load', () => {
    it('displays loading indicator', () => {
      const props = {
        currentUser: { userid: '1' },
        getWeeklySummaries: vi.fn(),
        updateWeeklySummaries: vi.fn(),
        loading: true,
        summaries: weeklySummaryMockData1,
        authUser: { role: '' },
        roles: [],
      };

      const store = mockStore({
        theme: themeMock,
      });

      render(
        <Provider store={store}>
          <WeeklySummary
            currentUser={props.currentUser}
            getWeeklySummaries={props.getWeeklySummaries}
            updateWeeklySummaries={props.updateWeeklySummaries}
            loading={props.loading}
            summaries={props.summaries}
            authUser={props.authUser}
            roles={props.roles}
          />
        </Provider>,
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('displays an error message if there is an error on data fetch', async () => {
      const props = {
        currentUser: { userid: '1' },
        getWeeklySummaries: vi.fn().mockResolvedValue(), // don't reject
        updateWeeklySummaries: vi.fn(),
        summaries: {}, // required to prevent crash
        authUser: { role: '' },
        roles: [],
        fetchError: { message: 'SOME ERROR CONNECTING!!!' },
        loading: false,
      };

      const store = mockStore({ theme: themeMock });

      render(
        <Provider store={store}>
          <WeeklySummary
            currentUser={props.currentUser}
            getWeeklySummaries={props.getWeeklySummaries}
            updateWeeklySummaries={props.updateWeeklySummaries}
            loading={props.loading}
            summaries={props.summaries}
            authUser={props.authUser}
            roles={props.roles}
            fetchError={props.fetchError}
          />
        </Provider>,
      );

      const errorNode = await screen.findByTestId('error');
      expect(errorNode).toBeInTheDocument();
      expect(errorNode).toHaveTextContent('SOME ERROR CONNECTING');
    });
  });

  describe('Tabs display', () => {
    let props = {
      currentUser: { userid: '1' },
      getWeeklySummaries: vi.fn(),
      updateWeeklySummaries: vi.fn(),
      loading: false,
      summaries: weeklySummaryMockData1,
      authUser: { role: '' },
      roles: [],
    };

    const store = mockStore({
      theme: themeMock,
    });

    beforeEach(() => {
      render(
        <Provider store={store}>
          <WeeklySummary
            currentUser={props.currentUser}
            getWeeklySummaries={props.getWeeklySummaries}
            updateWeeklySummaries={props.updateWeeklySummaries}
            loading={props.loading}
            summaries={props.summaries}
            authUser={props.authUser}
            roles={props.roles}
          />
        </Provider>,
      );
    });

    it('should display 4 tabs even when the user summaries related fields have not been initialized in the database', () => {
      props = {
        currentUser: { userid: '1' },
        getWeeklySummaries: vi.fn(),
        updateWeeklySummaries: vi.fn(),
        loading: false,
        summaries: {},
        authUser: { role: '' },
        roles: [],
      };

      const thisstore = mockStore({
        theme: themeMock,
      });

      render(
        <Provider store={thisstore}>
          <WeeklySummary
            currentUser={props.currentUser}
            getWeeklySummaries={props.getWeeklySummaries}
            updateWeeklySummaries={props.updateWeeklySummaries}
            loading={props.loading}
            summaries={props.summaries}
            authUser={props.authUser}
            roles={props.roles}
          />
        </Provider>,
      );

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
    it('should make 1st tab active when clicked', async () => {
      // First tab click.
      await userEvent.click(screen.getByTestId('tab-1'));
      expect(screen.getByTestId('tab-1').classList.contains('active')).toBe(true);
    });
    it('should make 2nd tab active when clicked', async () => {
      // Second tab click.
      await userEvent.click(screen.getByTestId('tab-2'));
      expect(screen.getByTestId('tab-2').classList.contains('active')).toBe(true);
    });
    it('should make 3rd tab active when clicked', async () => {
      // Third tab click.
      await userEvent.click(screen.getByTestId('tab-3'));
      expect(screen.getByTestId('tab-3').classList.contains('active')).toBe(true);
    });
    it('should make 4th tab active when clicked', async () => {
      // Fourth tab click.
      await userEvent.click(screen.getByTestId('tab-4'));
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

      await screen.findByText("Time's up!");

      expect(screen.getByText(/^time's up!$/i)).toBeInTheDocument();
    });
  });

  describe('Tooltips', () => {
    const props = {
      currentUser: { userid: '1' },
      getWeeklySummaries: vi.fn(),
      updateWeeklySummaries: vi.fn(),
      loading: false,
      summaries: weeklySummaryMockData1,
      authUser: { role: '' },
      roles: [],
    };

    const store = mockStore({
      theme: themeMock,
    });

    beforeEach(() => {
      render(
        <Provider store={store}>
          <WeeklySummary
            currentUser={props.currentUser}
            getWeeklySummaries={props.getWeeklySummaries}
            updateWeeklySummaries={props.updateWeeklySummaries}
            loading={props.loading}
            summaries={props.summaries}
            authUser={props.authUser}
            roles={props.roles}
          />
        </Provider>,
      );
    });

    const testTooltip = async testId => {
      const tooltipIcon = await screen.findByTestId(testId);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      await userEvent.hover(tooltipIcon);
      const tooltip = await screen.findByRole('tooltip');
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
      getWeeklySummaries: vi.fn(),
      updateWeeklySummaries: vi.fn(),
      loading: false,
      summaries: {},
      authUser: { role: '' },
      roles: [],
    };
    const store = mockStore({
      theme: themeMock,
    });

    beforeEach(() => {
      render(
        <Provider store={store}>
          <WeeklySummary
            currentUser={props.currentUser}
            getWeeklySummaries={props.getWeeklySummaries}
            updateWeeklySummaries={props.updateWeeklySummaries}
            loading={props.loading}
            summaries={props.summaries}
            authUser={props.authUser}
            roles={props.roles}
          />
        </Provider>,
      );
    });

    describe('Media URL field', () => {
      it('should render Media URL field properly', () => {
        expect(screen.getByTestId('media-input')).toBeInTheDocument();
      });
      it('should handle input change', async () => {
        // const labelText = screen.getByLabelText(/Link to your media files/i);
        // await userEvent.type(labelText, 'h');
        // expect(labelText).toHaveAttribute('value', 'h');
        const input = screen.getByTestId('media-input');
        fireEvent.change(input, { target: { value: 'u' } });
        // will pop up one modal ->click confirm
        // will pop up one modal ->click confirm
        fireEvent.click(screen.getByText('Confirm'));
        // then type the content
        // then type the content
        fireEvent.change(input, { target: { value: 'u' } });
        expect(input.value).toBe('u');
      });
      it('should display error message, confirm and close button when user input incorrect url input', async () => {
        const theurl = 'this is a test script';
        const element = screen.getByTestId('media-input');
        await userEvent.paste(element, theurl);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /Confirm/i })).toHaveLength(1);
        expect(screen.getAllByRole('button', { name: /Close/i })).toHaveLength(2);
      });
      it('should display an error message on invalid URL and remove the error message when the user types in a valid URL', async () => {
        // const labelText = screen.getByLabelText(/Link to your media files/i);
        // await userEvent.type(labelText, 'h');
        // expect(labelText).toHaveAttribute('value', 'h');
        // Display and error message.
        const input = screen.getByTestId('media-input');
        // const { queryByText } = render(<Modal/>);
        fireEvent.change(input, { target: { value: 'h' } });
        // will pop up one modal ->click confirm
        // will pop up one modal ->click confirm
        fireEvent.click(screen.getByText('Confirm'));
        // then type the content
        // then type the content
        fireEvent.change(input, { target: { value: 'h' } });
        expect(input.value).toBe('h');
        const mediaUrlError = screen.getByText(/"Media URL" must be a valid uri/i);
        expect(mediaUrlError).toBeInTheDocument();
        // Remove the error message when the URL is valid.
        fireEvent.change(input, { target: { value: 'https://www.example.com/' } });
        // await userEvent.type(labelText, 'https://www.example.com/');
        expect(mediaUrlError).not.toBeInTheDocument();
      });
      it('should display the correct url input', async () => {
        const correcturl = 'https://testweb.com';
        const element = screen.getByTestId('media-input');
        await userEvent.paste(element, correcturl);
        await userEvent.click(screen.getByText('Confirm'));
        await userEvent.paste(element, correcturl);
        expect(element).toHaveValue('https://testweb.com');
        expect(screen.getByText('Open link')).toBeInTheDocument();
      });
    });

    describe('Confirm media checkbox', () => {
      it('should be unchecked by default and can be checked', async () => {
        const mediaCheckbox = screen.getByTestId('mediaConfirm');
        expect(mediaCheckbox).not.toBeChecked();
        await userEvent.click(mediaCheckbox);
        expect(mediaCheckbox).toBeChecked();
      });
      it('should display an error message if a checkbox is unchecked after it was checked first', async () => {
        const mediaCheckbox = screen.getByTestId('mediaConfirm');
        expect(mediaCheckbox).not.toBeChecked();
        await userEvent.click(mediaCheckbox);
        expect(mediaCheckbox).toBeChecked();
        await userEvent.click(mediaCheckbox);
        expect(mediaCheckbox).not.toBeChecked();
        const mediaCheckboxError = screen.getByText(
          /Please confirm that you have provided the required media files./i,
        );
        expect(mediaCheckboxError).toBeInTheDocument();
      });
    });

    describe('Confirm editor was used checkbox', () => {
      it('should be unchecked by default and can be checked', async () => {
        const editorCheckbox = screen.getByTestId('editorConfirm');
        expect(editorCheckbox).not.toBeChecked();
        await userEvent.click(editorCheckbox);
        expect(editorCheckbox).toBeChecked();
      });
      it('should display an error message if a checkbox is unchecked after it was checked first', async () => {
        const editorCheckbox = screen.getByTestId('editorConfirm');
        expect(editorCheckbox).not.toBeChecked();
        await userEvent.click(editorCheckbox);
        expect(editorCheckbox).toBeChecked();
        await userEvent.click(editorCheckbox);
        expect(editorCheckbox).not.toBeChecked();
        const editorCheckboxError = screen.getByText(
          /Please confirm that you used an AI editor to write your summary./i,
        );
        expect(editorCheckboxError).toBeInTheDocument();
      });
    });

    describe('Confirm proofread checkbox', () => {
      it('should be unchecked by default and can be checked', async () => {
        const proofreadCheckbox = screen.getByTestId('proofreadConfirm');
        expect(proofreadCheckbox).not.toBeChecked();
        await userEvent.click(proofreadCheckbox);
        expect(proofreadCheckbox).toBeChecked();
      });
      it('should display an error message if a checkbox is unchecked after it was checked first', async () => {
        const proofreadCheckbox = screen.getByTestId('proofreadConfirm');
        expect(proofreadCheckbox).not.toBeChecked();
        await userEvent.click(proofreadCheckbox);
        expect(proofreadCheckbox).toBeChecked();
        await userEvent.click(proofreadCheckbox);
        expect(proofreadCheckbox).not.toBeChecked();
        const proofreadCheckboxError = screen.getByText(
          /Please confirm that you have proofread your summary./i,
        );
        expect(proofreadCheckboxError).toBeInTheDocument();
      });
    });

    describe('Handle save', () => {
      props = {
        ...props,
        updateWeeklySummaries: vi.fn().mockReturnValueOnce(200),
      };
      it('should save the form data when "Save" button is pressed', async () => {
        const saveButton = screen.getByRole('button', { name: /save/i });
        expect(saveButton).toBeDisabled();
        // Enable the button
        // provide media URL
        const input = screen.getByTestId('media-input');
        // const { queryByText } = render(<Modal/>);
        fireEvent.change(input, { target: { value: 'u' } });
        // will pop up one modal ->click confirm
        // will pop up one modal ->click confirm
        fireEvent.click(screen.getByText('Confirm'));
        fireEvent.change(input, { target: { value: 'https://www.example.com/' } });
        // const labelText = screen.getByLabelText(/Link to your media files/i);
        // await userEvent.type(labelText, 'https://www.example.com/');
        // check off the media URL concent checkbox
        await userEvent.click(screen.getByTestId('mediaConfirm'));
        await userEvent.click(screen.getByTestId('editorConfirm'));
        await userEvent.click(screen.getByTestId('proofreadConfirm'));
        expect(saveButton).toBeEnabled();
        await userEvent.click(saveButton);
      });
    });
  });
});
