import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import JobFormBuilder from '../JobFormbuilder';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');
vi.mock('../QuestionSetManager', () => ({ default: () => null }));
vi.mock('../QuestionEditModal', () => ({ default: () => null }));
vi.mock('../FormPreviewModal', () => ({ default: () => null }));

const store = {
  getState: () => ({ theme: { darkMode: false }, auth: { user: {} } }),
  subscribe: () => () => {},
  dispatch: () => true,
};

const renderBuilder = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <JobFormBuilder />
      </MemoryRouter>
    </Provider>,
  );

const questionLabels = () => screen.getAllByText(/^\d+\.\) /).map(element => element.textContent);

describe('question deletion confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        forms: [
          {
            _id: 'form-1',
            title: 'Software Engineer',
            questions: [
              { questionText: 'First question', questionType: 'textbox', visible: true },
              {
                questionText: 'Choose a skill',
                questionType: 'dropdown',
                options: ['React', 'Node'],
                visible: true,
              },
              { questionText: 'Last question', questionType: 'textbox', visible: true },
            ],
          },
        ],
      },
    });
    axios.delete.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('preserves the question, its choices and order when canceled', async () => {
    renderBuilder();
    await screen.findByText(/Choose a skill/);
    const before = questionLabels();

    fireEvent.click(screen.getAllByTitle('Delete question')[1]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(axios.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(axios.delete).not.toHaveBeenCalled();
    expect(questionLabels()).toEqual(before);
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Node' })).toBeInTheDocument();
  });

  it('deletes only the selected question after confirmation', async () => {
    renderBuilder();
    await screen.findByText(/Choose a skill/);

    fireEvent.click(screen.getAllByTitle('Delete question')[1]);

    expect(axios.delete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete question' }));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    expect(axios.delete).toHaveBeenCalledWith(
      ENDPOINTS.DELETE_QUESTION('form-1', 1),
      expect.any(Object),
    );
    expect(screen.queryByText(/Choose a skill/)).not.toBeInTheDocument();
    expect(questionLabels()).toEqual(['1.) First question', '2.) Last question']);
  });
});
