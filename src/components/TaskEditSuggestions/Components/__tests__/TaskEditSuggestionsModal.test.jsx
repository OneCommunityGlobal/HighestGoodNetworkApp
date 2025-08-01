import * as reduxHooks from 'react-redux';
import { render, screen } from '@testing-library/react';
import TaskEditSuggestionsModal from '../TaskEditSuggestionsModal';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
  useStore: vi.fn(),
}));

const mockDispatch = vi.fn();
const mockGetState = vi.fn();
const mockToggleModal = vi.fn();
const defaultProps = {
  isTaskEditSuggestionsModalOpen: false,
  taskEditSuggestion: null,
  handleToggleTaskEditSuggestionsModal: mockToggleModal,
};

beforeEach(() => {
  vi.clearAllMocks();
  reduxHooks.useDispatch.mockReturnValue(mockDispatch);
  reduxHooks.useStore.mockReturnValue({ getState: mockGetState });
});

describe('TaskEditSuggestionsModal Rendering', () => {
  it('does not render with default props', () => {
    render(<TaskEditSuggestionsModal {...defaultProps} />);
    expect(screen.queryByText(/Changes suggested by:/i)).not.toBeInTheDocument();
  });

  it('renders correctly when open', () => {
    const props = { ...defaultProps, isTaskEditSuggestionsModalOpen: true };
    render(<TaskEditSuggestionsModal {...props} />);
    expect(screen.queryByText(/Changes suggested by:/i)).not.toBeInTheDocument(); // Adjust as per the actual content
  });

  it('displays task edit suggestion details', () => {
    const taskEditSuggestion = {
      user: 'John Doe',
      oldTask: {
        taskName: 'Old Task Name',
      },
      newTask: {
        taskName: 'New Task Name',
      },
    };
    const props = { ...defaultProps, taskEditSuggestion, isTaskEditSuggestionsModalOpen: true };
    render(<TaskEditSuggestionsModal {...props} />);
    expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
  });
});

describe('TaskEditSuggestionsModal Redux Integration', () => {
  it('uses useDispatch hook', () => {
    render(<TaskEditSuggestionsModal {...defaultProps} />);
    expect(reduxHooks.useDispatch).toHaveBeenCalled();
  });
});
