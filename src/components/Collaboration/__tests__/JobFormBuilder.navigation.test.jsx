import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import axios from 'axios';
import JobFormBuilder from '../JobFormbuilder';
import { ENDPOINTS } from '../../../utils/URL';

vi.mock('axios', () => ({
  default: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));
vi.mock('react-redux', () => ({
  useDispatch: () => () => true,
  useSelector: selector => selector({ auth: { user: {} }, theme: { darkMode: false } }),
}));
vi.mock('../FormPreviewModal', () => ({ default: () => null }));
vi.mock('reactstrap', () => ({ UncontrolledTooltip: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/before');
  axios.get.mockImplementation(url =>
    Promise.resolve({
      data:
        url === ENDPOINTS.GET_ALL_JOB_FORMS
          ? {
              forms: [
                {
                  _id: 'form-1',
                  title: 'Developer',
                  questions: [
                    { questionText: 'First question', questionType: 'textbox', visible: true },
                    { questionText: 'Second question', questionType: 'textbox', visible: true },
                  ],
                },
              ],
            }
          : { templates: [] },
    }),
  );
  vi.spyOn(window, 'confirm').mockReturnValue(false);
});
afterEach(() => vi.restoreAllMocks());

async function openBuilder() {
  const history = createBrowserHistory();
  history.push('/jobformbuilder');
  history.push('/after');
  await new Promise(resolve => {
    const stop = history.listen(() => {
      stop();
      resolve();
    });
    history.goBack();
  });
  render(
    <Router history={history}>
      <Switch>
        <Route path="/jobformbuilder" component={JobFormBuilder} />
        <Route>
          <p>Another page</p>
        </Route>
      </Switch>
    </Router>,
  );
  await waitFor(() => expect(screen.getByPlaceholderText('Enter Field Label')).not.toBeDisabled());
  return history;
}

const edits = {
  'question draft': () =>
    fireEvent.change(screen.getByPlaceholderText('Enter Field Label'), {
      target: { value: 'Draft' },
    }),
  'job title': () =>
    fireEvent.change(screen.getByPlaceholderText('Enter Job Title'), {
      target: { value: 'Changed title' },
    }),
  'template name': () =>
    fireEvent.change(screen.getByLabelText('Template name'), {
      target: { value: 'Draft template' },
    }),
  'added question': () => {
    fireEvent.change(screen.getByPlaceholderText('Enter Field Label'), {
      target: { value: 'New question' },
    });
    fireEvent.click(screen.getByText('Add Field'));
  },
  'deleted question': () => fireEvent.click(screen.getAllByTitle('Delete question')[0]),
  'reordered question': () => fireEvent.click(screen.getAllByTitle('Move down')[0]),
  'edited question': () => {
    fireEvent.click(screen.getAllByText('Edit')[0]);
    fireEvent.change(screen.getByLabelText('Question Label:'), {
      target: { value: 'Edited label' },
    });
    fireEvent.click(screen.getByText('Save Changes'));
  },
};

describe('browser history navigation', () => {
  it.each(
    Object.entries(edits).flatMap(([name, edit]) =>
      ['goBack', 'goForward'].map(direction => [name, direction, edit]),
    ),
  )(
    'warns about %s on %s and stays on the builder when canceled',
    async (name, direction, edit) => {
      const history = await openBuilder();
      edit();
      expect(axios.post).not.toHaveBeenCalled();
      expect(axios.delete).not.toHaveBeenCalled();
      expect(axios.put).not.toHaveBeenCalled();
      act(() => history[direction]());
      await waitFor(() =>
        expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('unsaved changes')),
      );
      await waitFor(() => expect(window.location.pathname).toBe('/jobformbuilder'));
      expect(screen.getByText('Job Question Set Builder')).toBeInTheDocument();
    },
  );

  it('leaves without a warning after Save Form succeeds', async () => {
    const history = await openBuilder();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    axios.put.mockResolvedValueOnce({ data: {} });
    edits['added question']();
    fireEvent.click(screen.getByText('Save Form'));
    await waitFor(() => expect(screen.getByText('Save Form')).not.toBeDisabled());
    act(() => history.goBack());
    expect(await screen.findByText('Another page')).toBeInTheDocument();
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('allows leaving with unsaved changes when the user confirms', async () => {
    const history = await openBuilder();
    edits['question draft']();
    window.confirm.mockReturnValue(true);
    act(() => history.goForward());
    expect(await screen.findByText('Another page')).toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledOnce();
  });
});
