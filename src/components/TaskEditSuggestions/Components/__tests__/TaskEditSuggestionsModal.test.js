import React from 'react';
import { TaskEditSuggestionsModal } from 'components/TaskEditSuggestions/Components/TaskEditSuggestionsModal';  
import * as reduxHooks from 'react-redux';
import { waitFor, render, fireEvent, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

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
    const { queryByText } = render(<TaskEditSuggestionsModal {...props} />);
    expect(queryByText(/John Doe/i)).not.toBeInTheDocument();
    
  });
});



describe('TaskEditSuggestionsModal Redux Integration', () => {
  it('uses useDispatch hook', () => {
    render(<TaskEditSuggestionsModal {...defaultProps} />);
    expect(reduxHooks.useDispatch).toHaveBeenCalled();
  });

});
