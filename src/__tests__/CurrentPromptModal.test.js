import React from 'react';
import CurrentPromptModal from 'components/WeeklySummary/CurrentPromptModal';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

const mockWriteText = jest.fn();
const mockToastSuccess = jest.fn();

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
  it('render component without crashing', () => {
    render(<CurrentPromptModal />);
  });
  it('check view and copy current AI prompt button', async () => {
    render(<CurrentPromptModal />);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement.textContent).toBe('View and Copy Current AI Prompt');
    fireEvent.click(buttonElement);
    await waitFor(() => {
      const modalElement = screen.getByRole('dialog');
      expect(modalElement).toBeInTheDocument();
    });
  });
  it('check tooltip associated with the button', async () => {
    const { container } = render(<CurrentPromptModal />);
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
  it('check current AI prompt modal content', async () => {
    render(<CurrentPromptModal />);
    const buttonElement = screen.getByRole('button');
    expect(screen.queryByRole('document')).not.toBeInTheDocument();
    fireEvent.click(buttonElement);
    await waitFor(() => {
      const modalDialogElement = screen.getByRole('document');
      const modalContentElement = modalDialogElement.querySelector('.modal-content');
      const modalHeaderElement = modalContentElement.querySelector('.modal-header');
      const modalTitleElement = modalHeaderElement.querySelector('.modal-title');
      const modalBodyElement = modalContentElement.querySelector('.modal-body');
      expect(modalTitleElement.textContent).toBe('Current AI Prompt ');
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
  it('check close modal button', async () => {
    render(<CurrentPromptModal />);
    const buttonElement = screen.getByRole('button');
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
  it('check copy button inside the modal', async () => {
    render(<CurrentPromptModal />);
    const currentPrompt = `Please edit the following summary of my week's work. Make sure it is professionally written in 3rd person format.
  Write it as only one paragraph. It must be only one paragraph. Keep it less than 500 words. Start the paragraph with 'This week'.
  Make sure the paragraph contains no links or URLs and write it in a tone that is matter-of-fact and without embellishment.
  Do not add flowery language, keep it simple and factual. Do not add a final summary sentence. Apply all this to the following:`;
    const buttonElement = screen.getByRole('button');
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
