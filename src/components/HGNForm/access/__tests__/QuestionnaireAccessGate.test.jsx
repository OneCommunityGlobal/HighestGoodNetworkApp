import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import QuestionnaireAccessGate, {
  resetQuestionnaireAccessCache,
  withQuestionnaireAccess,
} from '../QuestionnaireAccessGate';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');

const mockStore = configureMockStore([]);
const store = mockStore({ auth: { user: { userid: 'user1' } }, theme: { darkMode: false } });

const renderGate = () =>
  render(
    <Provider store={store}>
      <QuestionnaireAccessGate>
        <div>Questionnaire content</div>
      </QuestionnaireAccessGate>
    </Provider>,
  );

describe('QuestionnaireAccessGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQuestionnaireAccessCache();
  });

  it('shows the questionnaire to people invited through the Dropbox process', async () => {
    axios.get.mockResolvedValue({ data: { eligible: true, reason: null } });

    renderGate();

    expect(await screen.findByText('Questionnaire content')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.HGN_FORM_ACCESS);
  });

  it('blocks people who were not invited through the Dropbox process', async () => {
    axios.get.mockResolvedValue({ data: { eligible: false, reason: 'NOT_INVITED' } });

    renderGate();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Highest Good Network Dropbox process/,
    );
    expect(screen.queryByText('Questionnaire content')).not.toBeInTheDocument();
  });

  it('blocks people invited to a Dropbox team folder other than Highest Good Network', async () => {
    axios.get.mockResolvedValue({ data: { eligible: false, reason: 'NOT_HGN_TEAM_FOLDER' } });

    renderGate();

    expect(await screen.findByRole('alert')).toHaveTextContent(/different team folder/);
    expect(screen.queryByText('Questionnaire content')).not.toBeInTheDocument();
  });

  it('explains when Dropbox access was revoked', async () => {
    axios.get.mockResolvedValue({ data: { eligible: false, reason: 'ACCESS_REVOKED' } });

    renderGate();

    expect(await screen.findByRole('alert')).toHaveTextContent(/has been revoked/);
  });

  it('blocks the questionnaire when the access check fails', async () => {
    axios.get.mockRejectedValue(new Error('network'));

    renderGate();

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not check your access/);
    expect(screen.queryByText('Questionnaire content')).not.toBeInTheDocument();
  });

  it('does not re-check access once a user is known to be eligible', async () => {
    axios.get.mockResolvedValue({ data: { eligible: true } });

    const { unmount } = renderGate();
    await screen.findByText('Questionnaire content');
    unmount();
    renderGate();

    expect(screen.getByText('Questionnaire content')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('sends eligible people from the permanent link to the first questionnaire page', async () => {
    axios.get.mockResolvedValue({ data: { eligible: true } });
    const LinkRedirect = withQuestionnaireAccess(() => <Redirect to="/hgnform/page1" />);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/questionnaire']}>
          <Route path="/questionnaire" component={LinkRedirect} />
          <Route path="/hgnform/page1" render={() => <div>Page 1</div>} />
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByText('Page 1')).toBeInTheDocument();
  });
});
