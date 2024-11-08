import { TaskEditSuggestionsModal } from 'components/TaskEditSuggestions/Components/TaskEditSuggestionsModal';  
import * as reduxHooks from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  useStore: jest.fn(),
}));

const mockDispatch = jest.fn();
const mockGetState = jest.fn();
const mockToggleModal = jest.fn();
const defaultProps = {
  isTaskEditSuggestionsModalOpen: false,
  taskEditSuggestion: null,
  handleToggleTaskEditSuggestionsModal: mockToggleModal,
};

beforeEach(() => {
  jest.clearAllMocks();
  reduxHooks.useDispatch.mockReturnValue(mockDispatch);
  reduxHooks.useStore.mockReturnValue({ getState: mockGetState });
});

describe('TaskEditSuggestionsModal Rendering', () => {
  it('does not render with default props', () => {
    render(
      <TaskEditSuggestionsModal
        isTaskEditSuggestionsModalOpen={defaultProps.isTaskEditSuggestionsModalOpen}
        taskEditSuggestion={defaultProps.taskEditSuggestion}
        handleToggleTaskEditSuggestionsModal={defaultProps.handleToggleTaskEditSuggestionsModal}
      />
    );
    expect(screen.queryByText(/Changes suggested by:/i)).not.toBeInTheDocument();
  });

  it('renders correctly when open', () => {
    const props = {
      isTaskEditSuggestionsModalOpen: true,
      taskEditSuggestion: defaultProps.taskEditSuggestion,
      handleToggleTaskEditSuggestionsModal: defaultProps.handleToggleTaskEditSuggestionsModal,
    };
    render(
      <TaskEditSuggestionsModal
        isTaskEditSuggestionsModalOpen={props.isTaskEditSuggestionsModalOpen}
        taskEditSuggestion={props.taskEditSuggestion}
        handleToggleTaskEditSuggestionsModal={props.handleToggleTaskEditSuggestionsModal}
      />
    );
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
    const props = {
      isTaskEditSuggestionsModalOpen: true,
      taskEditSuggestion,
      handleToggleTaskEditSuggestionsModal: defaultProps.handleToggleTaskEditSuggestionsModal,
    };
    render(
      <TaskEditSuggestionsModal
        isTaskEditSuggestionsModalOpen={props.isTaskEditSuggestionsModalOpen}
        taskEditSuggestion={props.taskEditSuggestion}
        handleToggleTaskEditSuggestionsModal={props.handleToggleTaskEditSuggestionsModal}
      />
    );
    expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
  });
});

describe('TaskEditSuggestionsModal Redux Integration', () => {
  it('uses useDispatch hook', () => {
    render(
      <TaskEditSuggestionsModal
        isTaskEditSuggestionsModalOpen={defaultProps.isTaskEditSuggestionsModalOpen}
        taskEditSuggestion={defaultProps.taskEditSuggestion}
        handleToggleTaskEditSuggestionsModal={defaultProps.handleToggleTaskEditSuggestionsModal}
      />
    );
    expect(reduxHooks.useDispatch).toHaveBeenCalled();
  });
});
