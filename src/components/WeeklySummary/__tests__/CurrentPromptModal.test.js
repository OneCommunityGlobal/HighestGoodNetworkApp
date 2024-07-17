import React from 'react';
import CurrentPromptModal from 'components/WeeklySummary/CurrentPromptModal';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import axios from 'axios';

const mockStore = configureStore([thunk]);

const theme = { darkMode: false };

let store;

beforeEach(() => {
  store = mockStore({
    theme: theme,
  });
});

const mockWriteText = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock('axios');

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
  });

  jest.mock('react-toastify', () => ({
    toast: { success: mockToastSuccess },
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CurrentPromptModal component', () => {
  it('render component without crashing', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    await act(async () => {
      render(
        <Provider store={store}>
          <CurrentPromptModal userId={'abc123'} userRole={'Manager'} darkMode={theme} />
        </Provider>,
      );
    });
  });
  it('check view and copy current AI prompt button', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId={'abc123'} userRole={'Manager'} darkMode={theme} />
        </Provider>,
      );
      await waitFor(() => {
        const buttonElement = container.querySelector('.ai-btn');
        expect(buttonElement.textContent).toBe('View and Copy Current AI Prompt');
        fireEvent.click(buttonElement);
        const modalElement = screen.getByRole('dialog');
        expect(modalElement).toBeInTheDocument();
      });
    });
  });
  it('check tooltip associated with the button', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId={'abc123'} userRole={'Manager'} darkMode={theme} />
        </Provider>,
      );
      await waitFor(async () => {
        const iconElement = container.querySelector('.fa.fa-info-circle');
        fireEvent.mouseEnter(iconElement);
        await waitFor(() => {
          expect(iconElement).toHaveAttribute('aria-describedby');
        });
        fireEvent.mouseLeave(iconElement);
        await waitFor(() => {
          expect(iconElement).not.toHaveAttribute('aria-describedby');
        });
      });
    });
  });
  it('check current AI prompt modal content', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      aIPromptText: `Please edit the following summary of my week's work. Make sure it is professionally written in 3rd person format.
  Write it as only one paragraph. It must be only one paragraph. Keep it less than 500 words. Start the paragraph with 'This week'.
  Make sure the paragraph contains no links or URLs and write it in a tone that is matter-of-fact and without embellishment.
  Do not add flowery language, keep it simple and factual. Do not add a final summary sentence. Apply all this to the following:`,
    });
    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId={'abc123'} userRole={'Manager'} darkMode={theme} />
        </Provider>,
      );
      await waitFor(() => {
        const buttonElement = container.querySelector('.ai-btn');
        fireEvent.click(buttonElement);

        const modalDialogElement = screen.getByRole('document');
        const modalContentElement = modalDialogElement.querySelector('.modal-content');
        const modalHeaderElement = modalContentElement.querySelector('.modal-header');
        const modalTitleElement = modalHeaderElement.querySelector('.modal-title');
        const modalBodyElement = modalContentElement.querySelector('.modal-body');
        expect(modalTitleElement.textContent).toBe('Current AI Prompt');
        expect(modalBodyElement.textContent).toContain(
          "Please edit the following summary of my week's work. Make sure it is professionally written in 3rd person format.",
        );
        expect(modalBodyElement.textContent).toContain(
          "Write it as only one paragraph. It must be only one paragraph. Keep it less than 500 words. Start the paragraph with 'This week'.",
        );
        expect(modalBodyElement.textContent).toContain(
          'Make sure the paragraph contains no links or URLs and write it in a tone that is matter-of-fact and without embellishment.',
        );
        expect(modalBodyElement.textContent).toContain(
          'Do not add flowery language, keep it simple and factual. Do not add a final summary sentence. Apply all this to the following:',
        );
      });
    });
  });
  it('check close modal button', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId={'abc123'} userRole={'Manager'} darkMode={theme} />
        </Provider>,
      );

      await waitFor(async () => {
        const buttonElement = container.querySelector('.ai-btn');
        fireEvent.click(buttonElement);
        await waitFor(() => {
          expect(screen.getByRole('document')).toBeInTheDocument();
        });
        const modalDialogElement = screen.getByRole('document');
        const modalContentElement = modalDialogElement.querySelector('.modal-content');
        const modalHeaderElement = modalContentElement.querySelector('.modal-header');
        const closeElement = modalHeaderElement.querySelector('.close');
        fireEvent.click(closeElement);
        await waitFor(() => {
          expect(screen.queryByRole('document')).not.toBeInTheDocument();
        });
      });
    });
  });
  it('check copy button inside the modal', async () => {
    axios.put.mockResolvedValue({
      status: 200,
      data: [],
    });
    await act(async () => {
      const { container } = render(
        <Provider store={store}>
          <CurrentPromptModal userId={'abc123'} userRole={'Manager'} darkMode={theme} />
        </Provider>,
      );
      const currentPrompt = `Please edit the following summary of my week's work. Make sure it is professionally written in 3rd person format.
  Write it as only one paragraph. It must be only one paragraph. Keep it less than 500 words. Start the paragraph with 'This week'.
  Make sure the paragraph contains no links or URLs and write it in a tone that is matter-of-fact and without embellishment.
  Do not add flowery language, keep it simple and factual. Do not add a final summary sentence. Apply all this to the following:`;

      await waitFor(async () => {
        const buttonElement = container.querySelector('.ai-btn');
        fireEvent.click(buttonElement);
        await waitFor(() => {
          expect(screen.getByRole('document')).toBeInTheDocument();
        });
        const modalDialogElement = screen.getByRole('document');
        const modalContentElement = modalDialogElement.querySelector('.modal-content');
        const modalFooterElement = modalContentElement.querySelector('.btn.btn-primary');
        expect(modalFooterElement.textContent).toBe('Copy Prompt');
        fireEvent.click(modalFooterElement);
        expect(mockWriteText).toHaveBeenCalledWith(currentPrompt);
        setTimeout(() => {
          expect(mockToastSuccess).toHaveBeenCalledWith('Prompt Copied!');
        }, 1000);
      });
    });
  });
});