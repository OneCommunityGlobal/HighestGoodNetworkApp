import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';
import WeeklySummaries from '../WeeklySummaries';

// Mock dependencies
jest.mock('html-react-parser', () => content => <div data-testid="parsed-html">{content}</div>);
jest.mock('@tinymce/tinymce-react', () => ({
  Editor: () => <div data-testid="mock-editor" />,
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock user auth and data
const authMock = {
  user: {
    userid: 'user123',
    username: 'testuser',
    roles: ['user'],
  },
};

// Mock role data
const roleMock = {
  rolePermissions: [
    {
      roleName: 'user',
      permissions: ['viewSummary', 'editSummary'],
    },
    {
      roleName: 'admin',
      permissions: ['viewSummary', 'editSummary', 'putUserProfile'],
    },
  ],
};

const renderWeeklySummaries = props => {
  const store = mockStore({
    auth: authMock,
    theme: { darkMode: false },
    role: roleMock,
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <WeeklySummaries {...props} />
      </BrowserRouter>
    </Provider>,
  );
};

describe('WeeklySummaries Component', () => {
  it('renders no summaries message when there are no summaries', () => {
    const userProfile = {
      _id: 'user123',
      weeklySummaries: [],
    };

    renderWeeklySummaries({ userProfile });

    expect(screen.getByText('No weekly summaries available')).toBeInTheDocument();
  });

  it('displays summaries when they are present', () => {
    const userProfile = {
      _id: 'user123',
      weeklySummaries: [
        { summary: '<p>Summary of this week</p>' },
        { summary: '<p>Summary of last week</p>' },
        { summary: '<p>Summary of the week before last</p>' },
      ],
      firstName: 'John',
      lastName: 'Doe',
    };

    renderWeeklySummaries({ userProfile });

    expect(screen.getByText("This week's summary")).toBeInTheDocument();
    expect(screen.getByText("Last week's summary")).toBeInTheDocument();
    expect(screen.getByText("The week before last's summary")).toBeInTheDocument();

    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBe(3);
  });

  it('displays no submission message when summary is not present', () => {
    const userProfile = {
      _id: 'user123',
      weeklySummaries: [{ summary: null }, { summary: null }, { summary: null }],
      firstName: 'John',
      lastName: 'Doe',
    };

    renderWeeklySummaries({ userProfile });

    const noSubmissionMessages = screen.getAllByText('John Doe did not submit a summary.');
    expect(noSubmissionMessages.length).toBe(3);
  });
});
