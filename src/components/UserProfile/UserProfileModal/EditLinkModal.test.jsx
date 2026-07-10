import React from "react";
import { fireEvent, within } from "@testing-library/react";
import EditLinkModal from "~/components/UserProfile/UserProfileModal/EditLinkModal";
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { rolesMock, authMock, userProfileMock, userProjectMock, themeMock } from "__tests__/mockStates";
import { renderWithProvider } from "__tests__/utils";


const VALID_URL = 'https://valid.url';
const INVALID_URL = 'invalid.';

const EmptyLinkUserProfile = {
  adminLinks: [],
  personlLinks: [],
  mediaUrl: undefined,
}
const filledUserProfile = {
  adminLinks:
    [
      { Name: 'Google Doc', Link: VALID_URL },
      { Name: 'Media Folder', Link: VALID_URL },
      { Name: 'New admin link', Link: 'https://admin.com' },
    ],
  personalLinks: [
    { Name: 'New personal link', Link: 'https://personal.com' }
  ],
  mediaUrl: VALID_URL
}

describe('EditLinkModal permission checks', () => {
  const mockStore = configureStore([thunk]);
  let store;
  let component;
  const props = {
    isOpen: true,
    closeModal: vi.fn(),
    updateLink: vi.fn(),
    userProfile: filledUserProfile,
  };

  beforeEach(() => {
    store = mockStore({
      auth: { ...authMock, isAdmin: false, user: { ...authMock.user, role: 'Volunteer' } },
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      theme: themeMock,
    });

    // eslint-disable-next-line testing-library/no-render-in-lifecycle
    component = renderWithProvider(<EditLinkModal {...props} />, { store })
  });

  it('should not display admin links input area for Volunteer', () => {
    // Two input elements for one exisintg Personal Link, another two for new added link
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(component.getAllByRole('textbox').length).toBe(4);
  })
})

describe('EditLinkModal with admin links and personal links', () => {

  const mockStore = configureStore([thunk]);
  let store;
  let component;
  const props = {
    isOpen: true,
    closeModal: vi.fn(),
    updateLink: vi.fn(),
    userProfile: filledUserProfile,
  };

  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      theme: themeMock,
    });

    // eslint-disable-next-line testing-library/no-render-in-lifecycle
    component = renderWithProvider(<EditLinkModal {...props} />, { store })
  });


  it('should add new admin link when add button is clicked', () => {
    // eslint-disable-next-line testing-library/no-node-access
    const newAdminLinkContainer = document.querySelector('.new-admin-links')
    const nameInput = within(newAdminLinkContainer).getByPlaceholderText('enter name');
    const linkInput = within(newAdminLinkContainer).getByPlaceholderText('enter link');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const adminAddButton = component.getAllByLabelText('add-admin-link-button')

    fireEvent.change(nameInput, { target: { value: 'New Admin Link' } });
    fireEvent.change(linkInput, { target: { value: 'https://example.com/newadminlink' } });
    fireEvent.click(adminAddButton[0]);

    // eslint-disable-next-line testing-library/prefer-screen-queries
    const delButton = component.getByRole('button', { name: 'x' });;
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const newAdminLinkName = component.getByPlaceholderText('Link Name')
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const newAdminLinkURL = component.getByDisplayValue('https://example.com/newadminlink');
    expect(delButton).toBeInTheDocument();
    expect(newAdminLinkName).toBeInTheDocument();
    expect(newAdminLinkURL).toBeInTheDocument();

  })

  it('should popup warning when media url is changed', () => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const mediaFolderLink = component.getByPlaceholderText('Enter Dropbox link');
    fireEvent.change(mediaFolderLink, { target: { value: 'INVALID_URL' } });
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(component.getByTestId('popup-warning')).toBeInTheDocument();
  });

  it('should display diff warning when editing media url', () => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const mediaFolderLink = component.getByPlaceholderText('Enter Dropbox link');
    fireEvent.change(mediaFolderLink, { target: { value: 'changed url' } });
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(component.getByTestId('diff-media-url-warning')).toBeInTheDocument();
    // Display original link
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(component.getByText(VALID_URL)).toBeInTheDocument();
  })

  it('should restore media url after "Cancel" button is clicked', () => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const mediaFolderLink = component.getByPlaceholderText('Enter Dropbox link');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const cancelButton = component.getByText('Cancel');
    //  Edit existing media url
    fireEvent.change(mediaFolderLink, { target: { value: 'changed url' } });
    fireEvent.click(cancelButton);
    expect(mediaFolderLink.value).toBe(VALID_URL);
  })

  it('should remove existing links after delete button is clicked', () => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const delButtons = component.getAllByText('x');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const addedAdminLink = component.getByDisplayValue('New admin link')
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const addedPersonalLink = component.getByDisplayValue('New personal link')
    delButtons.forEach(button => {
      fireEvent.click(button);
    })
    expect(addedAdminLink).not.toBeInTheDocument();
    expect(addedPersonalLink).not.toBeInTheDocument();
  })

  it('should display warning when invalid url is typed', () => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const googleInput = component.getByPlaceholderText('Enter Google Doc link');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const updateButton = component.getByText('Update');
    fireEvent.change(googleInput, { target: { value: INVALID_URL } });
    fireEvent.click(updateButton);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(component.getByTestId('invalid-url-warning')).toBeInTheDocument();
  })
});


describe('Edit Link Modal with empty links', () => {
  const mockStore = configureStore([thunk]);
  let store;
  let component;
  const props = {
    isOpen: true,
    closeModal: vi.fn(),
    updateLink: vi.fn(),
    userProfile: EmptyLinkUserProfile,
  };

  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProjects: userProjectMock,
      userProfile: userProfileMock,
      role: rolesMock.role,
      theme: themeMock,
    });

    // eslint-disable-next-line testing-library/no-render-in-lifecycle
    component = renderWithProvider(<EditLinkModal {...props} />, { store })
  });

  it('should render special admin link labels when empty admin links', () => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const googleDocLabel = component.getByLabelText('Google Doc')
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const mediaFolderLink = component.getByPlaceholderText('Enter Dropbox link');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const updateButton = component.getByText('Update')
    expect(googleDocLabel).toBeEmptyDOMElement;
    expect(mediaFolderLink).toBeEmptyDOMElement;
    expect(updateButton).toBeDisabled();
  })

  it('should not popup warning when empty media url is editing', () => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const mediaFolderLink = component.getByPlaceholderText('Enter Dropbox link');
    fireEvent.change(mediaFolderLink, { target: { value: 'INVALID_URL' } });
    expect(component.container).not.toHaveAttribute('data-testid', 'popup-warning');
  })
})

