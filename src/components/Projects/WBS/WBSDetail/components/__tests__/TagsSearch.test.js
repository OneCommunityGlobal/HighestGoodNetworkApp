import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TagsSearch from '../TagsSearch';

// mock member data
const allMembers = [
  {
    firstName: 'aaa',
    isActive: true,
    lastName: 'volunteer',
    _id: 'aaa123',
  },
  { firstName: 'bbb', isActive: true, lastName: 'test', _id: 'bbb456' },
  { firstName: 'ccc', isActive: false, lastName: 'manager', _id: 'ccc789' },
  { firstName: 'aaa', isActive: true, lastName: 'owner', _id: 'aaa067' },
];

const mockFunctions = mockResourceItems => {
  // assign usernames to the task
  const addResources = jest.fn((userID, firstName, lastName) => {
    mockResourceItems.push({
      userID,
      name: `${firstName} ${lastName}`,
      undefined,
    });
  });

  // remove assigned usernames from the task
  const removeResources = jest.fn(userID => {
    mockResourceItems.splice(
      mockResourceItems.findIndex(item => item.userID === userID),
      1,
    );
  });
  return { addResources, removeResources };
};

describe('Tags Search component', () => {
  it('renders without crashing', () => {
    const resourceItems = [];
    const { addResources, removeResources } = mockFunctions(resourceItems);
    render(
      <TagsSearch
        placeholder="Add resources"
        members={allMembers.filter(user => user.isActive)}
        resourceItems={resourceItems}
        addResources={addResources}
        removeResource={removeResources}
      />,
    );
  });
  it('check if search bar works properly', async () => {
    const resourceItems = [];
    const { addResources, removeResources } = mockFunctions(resourceItems);
    render(
      <TagsSearch
        placeholder="Add resources"
        members={allMembers.filter(user => user.isActive)}
        resourceItems={resourceItems}
        addResources={addResources}
        removeResource={removeResources}
      />,
    );
    const searchInputElement = screen.getByPlaceholderText('Add resources');
    fireEvent.change(searchInputElement, { target: { value: 'aaa' } });

    await waitFor(() => {
      expect(screen.queryByText('aaa volunteer')).toBeInTheDocument();
      expect(screen.queryByText('aaa owner')).toBeInTheDocument();
      expect(screen.queryByText('bbb test')).not.toBeInTheDocument();
      expect(screen.queryByText('ccc manager')).not.toBeInTheDocument();
    });
  });
  it('check filtered text click: add resources', async () => {
    const resourceItems = [];
    const { addResources, removeResources } = mockFunctions(resourceItems);
    const { container } = render(
      <TagsSearch
        placeholder="Add resources"
        members={allMembers.filter(user => user.isActive)}
        resourceItems={resourceItems}
        addResources={addResources}
        removeResource={removeResources}
      />,
    );
    const searchInputElement = screen.getByPlaceholderText('Add resources');
    fireEvent.change(searchInputElement, { target: { value: 'aaa' } });

    await waitFor(() => {});
    const userOneElement = screen.getByText('aaa volunteer');
    const userTwoElement = screen.getByText('aaa owner');

    fireEvent.click(userOneElement);
    fireEvent.click(userTwoElement);

    //
    const assignedUserElement = container.querySelectorAll(
      '.rounded-pill.badge.bg-primary.text-wrap',
    );
    expect(assignedUserElement.length).toEqual(resourceItems.length);
    expect(assignedUserElement[0].textContent).toBe('aaa volunteer');
    expect(assignedUserElement[1].textContent).toBe('aaa owner');

    expect(addResources).toHaveBeenCalledWith(
      allMembers[0]._id,
      allMembers[0].firstName,
      allMembers[0].lastName,
    );
    expect(addResources).toHaveBeenCalledWith(
      allMembers[3]._id,
      allMembers[3].firstName,
      allMembers[3].lastName,
    );
    expect(addResources).not.toHaveBeenCalledWith(
      allMembers[1]._id,
      allMembers[1].firstName,
      allMembers[1].lastName,
    );
    expect(addResources).not.toHaveBeenCalledWith(
      allMembers[2]._id,
      allMembers[2].firstName,
      allMembers[2].lastName,
    );
  });
  it('check filtered text click: add resources not called when the user does not click on the name', async () => {
    const resourceItems = [];
    const { addResources, removeResources } = mockFunctions(resourceItems);
    const { container } = render(
      <TagsSearch
        placeholder="Add resources"
        members={allMembers.filter(user => user.isActive)}
        resourceItems={resourceItems}
        addResources={addResources}
        removeResource={removeResources}
      />,
    );
    const searchInputElement = screen.getByPlaceholderText('Add resources');
    fireEvent.change(searchInputElement, { target: { value: 'aaa' } });

    expect(addResources).not.toHaveBeenCalled();
  });
  it('check filtered text click: remove resources', async () => {
    let resourceItems;
    resourceItems = [];

    const { addResources, removeResources } = mockFunctions(resourceItems);
    const { container, rerender } = render(
      <TagsSearch
        placeholder="Add resources"
        members={allMembers.filter(user => user.isActive)}
        resourceItems={resourceItems}
        addResources={addResources}
        removeResource={removeResources}
      />,
    );

    const searchInputElement = screen.getByPlaceholderText('Add resources');
    fireEvent.change(searchInputElement, { target: { value: 'aaa' } });

    await waitFor(() => {});
    const userOneElement = screen.getByText('aaa volunteer');
    const userTwoElement = screen.getByText('aaa owner');

    fireEvent.click(userOneElement);
    fireEvent.click(userTwoElement);

    const removeUserOneElement = container.querySelectorAll(
      '.rounded-pill.badge.bg-primary.text-wrap',
    );
    fireEvent.click(removeUserOneElement[0]);
    expect(removeResources).toHaveBeenCalledWith(allMembers[0]._id);

    // rerender with updated newResourceItems prop
    rerender(
      <TagsSearch
        placeholder="Add resources"
        members={allMembers.filter(user => user.isActive)}
        resourceItems={resourceItems}
        addResources={addResources}
        removeResource={removeResources}
      />,
    );

    // check the usernames after newResourceItems is updated after calling removeResources
    const assignedUserElement = container.querySelectorAll(
      '.rounded-pill.badge.bg-primary.text-wrap',
    );
    expect(assignedUserElement.length).toEqual(resourceItems.length);
    expect(assignedUserElement[0].textContent).toBe('aaa owner');
  });
});
