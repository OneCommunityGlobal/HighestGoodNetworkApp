import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';
import WeeklySummaries, { moveWeeklySummary } from '../WeeklySummaries';

const actionMocks = vi.hoisted(() => ({
  updateWeeklySummaries: vi.fn(() => async () => 200),
}));

vi.mock('../../../actions/weeklySummaries', () => ({
  updateWeeklySummaries: actionMocks.updateWeeklySummaries,
}));

// Mock dependencies
vi.mock('html-react-parser', () => ({
  default: (content) => <div data-testid="parsed-html">{content}</div>
}));
vi.mock('@tinymce/tinymce-react', () => ({
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
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <WeeklySummaries {...props} />
      </BrowserRouter>
    </Provider>,
  );
};

describe('WeeklySummaries Component', () => {
  beforeEach(() => {
    actionMocks.updateWeeklySummaries.mockClear();
  });

  it('moves summary content to an empty week while preserving week dates', () => {
    const uploadDate = '2026-07-30T12:00:00.000Z';
    const weeklySummaries = [
      {
        summary: 'Summary of this week',
        dueDate: '2026-08-01T23:59:59.999Z',
        uploadDate: '2026-07-29T12:00:00.000Z',
      },
      {
        summary: '',
        dueDate: '2026-07-25T23:59:59.999Z',
      },
      {
        summary: 'Summary of the week before last',
        dueDate: '2026-07-18T23:59:59.999Z',
      },
      {
        summary: 'Hidden fourth summary',
        dueDate: '2026-07-11T23:59:59.999Z',
      },
    ];

    const result = moveWeeklySummary(weeklySummaries, 0, 1, uploadDate);

    expect(result[0]).toEqual({
      summary: '',
      dueDate: weeklySummaries[0].dueDate,
    });
    expect(result[1]).toEqual({
      summary: weeklySummaries[0].summary,
      dueDate: weeklySummaries[1].dueDate,
      uploadDate,
    });
    expect(result[2]).toEqual(weeklySummaries[2]);
    expect(result[3]).toEqual(weeklySummaries[3]);
  });

  it('does not move a summary onto an occupied week', () => {
    const weeklySummaries = [
      { summary: 'Current week' },
      { summary: 'Last week' },
      { summary: '' },
    ];

    expect(moveWeeklySummary(weeklySummaries, 0, 1)).toBeNull();
  });

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

  it("opens the inline editor for an empty last week's summary", () => {
    const userProfile = {
      _id: 'user123',
      weeklySummaries: [
        { summary: '<p>Summary of this week</p>' },
        { summary: '' },
        { summary: '<p>Summary of the week before last</p>' },
      ],
      firstName: 'John',
      lastName: 'Doe',
    };

    renderWeeklySummaries({ userProfile });

    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[1]);

    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    expect(screen.getByText("Last week's summary")).toBeInTheDocument();
  });

  it('moves a summary to an empty destination in one update', async () => {
    const userProfile = {
      _id: 'user123',
      weeklySummaries: [
        {
          summary: '<p>Summary of this week</p>',
          dueDate: '2026-08-01T23:59:59.999Z',
          uploadDate: '2026-07-29T12:00:00.000Z',
        },
        { summary: '', dueDate: '2026-07-25T23:59:59.999Z' },
        {
          summary: '<p>Summary of the week before last</p>',
          dueDate: '2026-07-18T23:59:59.999Z',
        },
        {
          summary: '<p>Hidden fourth summary</p>',
          dueDate: '2026-07-11T23:59:59.999Z',
        },
      ],
      weeklySummariesCount: 3,
      mediaUrl: '',
      adminLinks: [
        {
          Name: 'Media Folder',
          Link: 'https://example.com/media',
        },
      ],
      firstName: 'John',
      lastName: 'Doe',
    };

    renderWeeklySummaries({ userProfile });

    fireEvent.click(screen.getAllByRole('button', { name: 'Move' })[0]);

    const destinationSelect = screen.getByLabelText('Move to');
    expect(destinationSelect.options[1]).toBeDisabled();
    expect(destinationSelect.options[2]).not.toBeDisabled();
    expect(destinationSelect.options[3]).toBeDisabled();

    fireEvent.change(destinationSelect, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Move' }));

    await waitFor(() => expect(actionMocks.updateWeeklySummaries).toHaveBeenCalledTimes(1));

    const [userId, update] = actionMocks.updateWeeklySummaries.mock.calls[0];
    expect(userId).toBe(userProfile._id);
    expect(update.weeklySummaries[0]).toEqual({
      summary: '',
      dueDate: userProfile.weeklySummaries[0].dueDate,
    });
    expect(update.weeklySummaries[1].summary).toBe(userProfile.weeklySummaries[0].summary);
    expect(update.weeklySummaries[1].dueDate).toBe(userProfile.weeklySummaries[1].dueDate);
    expect(update.weeklySummaries[1].uploadDate).toBeTruthy();
    expect(update.weeklySummaries[3]).toEqual(userProfile.weeklySummaries[3]);
    expect(update.mediaUrl).toBe(userProfile.adminLinks[0].Link);
  });
});
