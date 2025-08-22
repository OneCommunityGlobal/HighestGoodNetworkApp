import { vi } from 'vitest';

vi.mock('react-redux', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDispatch: vi.fn(),
    useSelector: vi.fn(),
  };
});

import * as reactRedux from 'react-redux';
import { render, screen, fireEvent } from '@testing-library/react';
import AssignTableRow from '~/components/Badge/AssignTableRow';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);

function renderComponent(props, initialState = {}) {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <table>
        <tbody>
          <AssignTableRow {...props} />
        </tbody>
      </table>
    </Provider>,
  );
}

describe('AssignTableRow', () => {
  const defaultBadge = {
    _id: '1',
    imageUrl: 'image-url',
    badgeName: 'Badge Name',
    description: 'Badge Description',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    reactRedux.useSelector.mockReturnValue([]);
  });

  it('renders the badge name and a checkbox', () => {
    renderComponent({ badge: defaultBadge, index: 0 });
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('dispatches ADD_SELECT_BADGE when checking an unchecked box', () => {
    const dispatch = vi.fn();
    reactRedux.useDispatch.mockReturnValue(dispatch);

    renderComponent({ badge: defaultBadge, index: 0 });
    const cb = screen.getByRole('checkbox');
    expect(cb).not.toBeChecked();

    fireEvent.click(cb);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ADD_SELECT_BADGE', badgeId: 'assign-badge-1' }),
    );
  });

  it('dispatches REMOVE_SELECT_BADGE when unchecking a checked box', () => {
    const dispatch = vi.fn();
    reactRedux.useDispatch.mockReturnValue(dispatch);
    reactRedux.useSelector.mockReturnValue(['assign-badge-1']);

    renderComponent({ badge: defaultBadge, index: 0 });
    const cb = screen.getByRole('checkbox');
    expect(cb).toBeChecked();

    fireEvent.click(cb);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'REMOVE_SELECT_BADGE', badgeId: 'assign-badge-1' }),
    );
  });

  it('does not blow up if selector returns an unexpected ID', () => {
    reactRedux.useSelector.mockReturnValue(['no-such-badge']);
    renderComponent({ badge: defaultBadge, index: 0 });
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('gracefully handles undefined selectedBadges', () => {
    reactRedux.useSelector.mockReturnValue(undefined);
    renderComponent({ badge: defaultBadge, index: 0 });
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('doesn’t crash on incomplete badge data', () => {
    renderComponent({ badge: {}, index: 0 });
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('works with a non-number index', () => {
    renderComponent({ badge: defaultBadge, index: 'foo' });
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('works when imageUrl is missing', () => {
    renderComponent({ badge: { ...defaultBadge, imageUrl: undefined }, index: 0 });
    expect(screen.getByText('Badge Name')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});
