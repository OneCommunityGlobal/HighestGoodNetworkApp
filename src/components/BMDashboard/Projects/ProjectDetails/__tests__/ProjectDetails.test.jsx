import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { MemoryRouter, Route } from 'react-router-dom';
import ProjectDetails from '../ProjectDetails';

vi.mock('../../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: vi.fn(() => ({ type: 'FETCH_BM_PROJECTS' })),
}));

vi.mock('../LogBar', () => ({
  LoggingButtons: () => null,
  AddItemButtons: () => null,
  TeamButtons: ({ projectId }) => <a href={`/bmdashboard/issues/add/${projectId}`}>Log Issue</a>,
}));

vi.mock('../RentedTools/RentedToolsDisplay', () => ({
  default: () => null,
}));

vi.mock('../Materials/MaterialsDisplay', () => ({
  default: () => null,
}));

vi.mock('../ProjectLog', () => ({
  default: () => null,
}));

const mockStore = createMockStore([]);

describe('ProjectDetails', () => {
  it('passes the selected project ID to the Log Issue button', () => {
    const projectId = '6823e200a3475f85a80d5d9c';

    const store = mockStore({
      theme: { darkMode: false },
      bmProjects: [{ _id: projectId, name: 'Test Project' }],
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/bmdashboard/projects/${projectId}`]}>
          <Route path="/bmdashboard/projects/:projectId">
            <ProjectDetails />
          </Route>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByRole('link', { name: 'Log Issue' })).toHaveAttribute(
      'href',
      `/bmdashboard/issues/add/${projectId}`,
    );
  });
});
