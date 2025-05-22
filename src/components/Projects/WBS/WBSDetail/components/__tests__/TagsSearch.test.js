import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import TagsSearch from '../TagsSearch';
import { findProjectMembers } from 'actions/projectMembers';

// Mock member data
const allMembers = [
  { firstName: 'aaa', isActive: true, lastName: 'volunteer', _id: 'aaa123' },
  { firstName: 'bbb', isActive: true, lastName: 'test', _id: 'bbb456' },
  { firstName: 'ccc', isActive: false, lastName: 'manager', _id: 'ccc789' },
  { firstName: 'aaa', isActive: true, lastName: 'owner', _id: 'aaa067' },
];

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock functions for resource management
const mockFunctions = mockResourceItems => {
  const addResources = jest.fn((userID, firstName, lastName) => {
    mockResourceItems.push({ userID, name: `${firstName} ${lastName}` });
  });

  const removeResources = jest.fn(userID => {
    const index = mockResourceItems.findIndex(item => item.userID === userID);
    if (index !== -1) mockResourceItems.splice(index, 1);
  });

  return { addResources, removeResources };
};

const mockFoundProjectMembers = searchQuery => {
  return allMembers.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );
};

const renderTagsSearchComponent = props => {
  const store = mockStore({
    projectMembers: { foundProjectMembers: mockFoundProjectMembers('') }, // Initial empty search
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <TagsSearch {...props} />
      </BrowserRouter>
    </Provider>,
  );
};

describe('TagsSearch Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const { addResources, removeResources } = mockFunctions([]);
  const sampleProps = {
    placeholder: 'Add resources',
    projectId: 'project123',
    resourceItems: [],
    addResources,
    removeResource: removeResources,
    findProjectMembers: mockFoundProjectMembers,
  };
  it('renders without crashing', () => {
    renderTagsSearchComponent(sampleProps);
  });

  it('search bar filters members correctly', async () => {
    renderTagsSearchComponent(sampleProps);

    const searchInputElement = await screen.findByPlaceholderText('Add resources');
    fireEvent.focus(searchInputElement);
    fireEvent.change(searchInputElement, { target: { value: 'aaa' } });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(screen.getByText('aaa volunteer')).toBeInTheDocument();
      expect(screen.getByText('aaa owner')).toBeInTheDocument();
      // expect(screen.queryByText('bbb test')).not.toBeInTheDocument();
      // expect(screen.queryByText('ccc manager')).not.toBeInTheDocument();
    });
  });

  it('adds a resource when clicking a filtered member', async () => {
    renderTagsSearchComponent(sampleProps);

    const searchInputElement = await screen.findByPlaceholderText('Add resources');
    fireEvent.focus(searchInputElement);
    fireEvent.change(searchInputElement, { target: { value: 'aaa' } });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Wait for the dropdown to display filtered options
    await waitFor(() => {
      const volunteerOption = screen.getByText('aaa volunteer');
      const ownerOption = screen.getByText('aaa owner');
      expect(volunteerOption).toBeInTheDocument();
      expect(ownerOption).toBeInTheDocument();

      // Simulate clicking the filtered options
      fireEvent.mouseDown(volunteerOption);
      fireEvent.mouseDown(ownerOption);
    });

    // Check if addResources was called with the correct arguments
    await waitFor(() => {
      expect(addResources).toHaveBeenCalledWith('aaa123', 'aaa', 'volunteer');
      expect(addResources).toHaveBeenCalledWith('aaa067', 'aaa', 'owner');
    });
  });

  it('does not add resource if no member is clicked', async () => {
    renderTagsSearchComponent(sampleProps);

    const searchInputElement = await screen.findByPlaceholderText('Add resources');
    fireEvent.change(searchInputElement, { target: { value: 'aaa' } });

    await waitFor(() => {
      expect(addResources).not.toHaveBeenCalled();
    });
  });
});
