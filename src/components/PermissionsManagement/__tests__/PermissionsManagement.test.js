import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {hasPermission} from '../../../utils/permissions';
import PermissionsManagement from '../PermissionsManagement';
// /Users/belagaam/Desktop/One Community/HighestGoodNetworkApp/src/utils/permissions.js

// Mocking dependencies and functions
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('react-redux', () => ({
  connect: () => component => component,
}));
jest.mock('actions/userProfile', () => ({
  updateUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
}));
jest.mock('actions/userManagement', () => ({
  getAllUserProfile: jest.fn(),
}));

// /Users/belagaam/Desktop/One Community/HighestGoodNetworkApp/src/components/PermissionsManagement/__tests__/PermissionsManagement.test.js
// /Users/belagaam/Desktop/One Community/HighestGoodNetworkApp/src/actions
jest.mock('../../../actions/role', () => ({
  getAllRoles: jest.fn(),
}));
jest.mock('../../../actions/information', () => ({
  getInfoCollections: jest.fn(),
}));
jest.mock('../../../utils/permissions', () => jest.fn(() => true)); // Mocking hasPermission function

describe('PermissionsManagement component', () => {
  beforeEach(() => {
    // Mocking initial state or context if needed
  });

  test('renders PermissionsManagement component', () => {
    render(<PermissionsManagement />);
    // You can add more specific assertions based on your component structure
    expect(screen.getByText('User Roles')).toBeInTheDocument();
  });

  test('clicking Add New Role button opens the New Role modal', () => {
    render(<PermissionsManagement />);
    fireEvent.click(screen.getByText('Add New Role'));
    expect(screen.getByText('Create New Role')).toBeInTheDocument();
  });

  test('clicking Manage User Permissions button opens the User Permissions modal', () => {
    render(<PermissionsManagement />);
    fireEvent.click(screen.getByText('Manage User Permissions'));
    expect(screen.getByText('Manage User Permissions')).toBeInTheDocument();
  });

  // You can add more test cases based on the component's functionality
});


// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import PermissionsManagement from '../PermissionsManagement';

// // Mocking dependencies and functions
// jest.mock('react-router-dom', () => ({
//   useHistory: () => ({
//     push: jest.fn(),
//   }),
// }));
// jest.mock('react-redux', () => ({
//   connect: () => component => component,
//   useSelector: jest.fn(),
// }));
// // Mocking the hasPermission function
// // jest.mock('../../../utils/permissions', () => jest.fn(() => true));
// jest.mock('../../../utils/permissions', () => require('../../../utils/permissions'));
// describe('PermissionsManagement component', () => {
//   beforeEach(() => {
//     // Mocking initial state or context if needed
//   });

//   test('renders PermissionsManagement component', () => {
//     render(<PermissionsManagement />);
//     // You can add more specific assertions based on your component structure
//     expect(screen.getByText('User Roles')).toBeInTheDocument();
//   });

//   test('clicking Add New Role button opens the New Role modal', () => {
//     render(<PermissionsManagement />);
//     fireEvent.click(screen.getByText('Add New Role'));
//     expect(screen.getByText('Create New Role')).toBeInTheDocument();
//   });

//   test('clicking Manage User Permissions button opens the User Permissions modal', () => {
//     render(<PermissionsManagement />);
//     fireEvent.click(screen.getByText('Manage User Permissions'));
//     expect(screen.getByText('Manage User Permissions')).toBeInTheDocument();
//   });

//   // You can add more test cases based on the component's functionality
// });
