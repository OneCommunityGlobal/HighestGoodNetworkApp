import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { createStore, combineReducers } from 'redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import hgnForm from '~/reducers/hgnFormReducers';
import { ENDPOINTS } from '~/utils/URL';
import FollowupQuestions from '../questionpages/FollowupQuestions';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const PAGE5 = '/hgnform/page5';
const PAGE6 = '/hgnform/page6';
const TWENTY_WORDS = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ');

const questions = [1, 2, 3, 4, 5].map(qno => ({
  _id: `q${qno}`,
  page: 5,
  qno,
  title: 'followup',
  text: `Follow-up question ${qno}`,
}));

const setup = (mernWorkExperience = TWENTY_WORDS) => {
  const formState = hgnForm(undefined, { type: '@@INIT' });
  const store = createStore(
    combineReducers({
      hgnForm,
      theme: (state = { darkMode: false }) => state,
      auth: (state = { user: { userid: 'user1' } }) => state,
    }),
    {
      hgnForm: {
        ...formState,
        followup_platform: 'Windows',
        followup_mern_work_experience: mernWorkExperience,
      },
    },
  );
  const history = createMemoryHistory({
    initialEntries: [{ pathname: PAGE5, state: { isOwner: false } }],
  });
  render(
    <Provider store={store}>
      <Router history={history}>
        <Route path={PAGE5} component={FollowupQuestions} />
        <Route path={PAGE6} render={() => <div>THANK YOU PAGE</div>} />
      </Router>
    </Provider>,
  );
  return { history };
};

const submit = async () => {
  await screen.findByText('Follow-up question 1');
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
};

describe('FollowupQuestions submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: questions });
  });

  it('goes to the final page only after the submission is saved', async () => {
    axios.post.mockResolvedValue({ status: 201 });
    const { history } = setup();

    await submit();

    await waitFor(() => expect(history.location.pathname).toBe(PAGE6));
    expect(axios.post).toHaveBeenCalledWith(
      ENDPOINTS.HGN_FORM_SUBMIT,
      expect.objectContaining({ user_id: 'user1' }),
    );
    expect(toast.success).toHaveBeenCalledWith('Form submitted successfully!');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('stays on the page and explains why when the submission is refused (403)', async () => {
    axios.post.mockRejectedValue({ response: { status: 403, data: { error: 'Forbidden' } } });
    const { history } = setup();

    await submit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'You are not authorized to submit this questionnaire.',
      ),
    );
    expect(history.location.pathname).toBe(PAGE5);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('stays on the page and shows the server error when the submission fails (500)', async () => {
    axios.post.mockRejectedValue({
      response: { status: 500, data: { error: 'Database unavailable' } },
    });
    const { history } = setup();

    await submit();

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Database unavailable'));
    expect(history.location.pathname).toBe(PAGE5);
  });

  it('stays on the page with a generic message when the request fails without a response', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    const { history } = setup();

    await submit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error submitting form. Please try again.'),
    );
    expect(history.location.pathname).toBe(PAGE5);
  });

  it('does not submit when the MERN work experience answer is under 20 words', async () => {
    const { history } = setup('too short');

    await submit();

    expect(toast.error).toHaveBeenCalledWith('Please enter at least 20 words.');
    expect(axios.post).not.toHaveBeenCalled();
    expect(history.location.pathname).toBe(PAGE5);
  });
});
