import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Projects from '..';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { rolesMock } from '__tests__/mockStates';

import axios from 'axios';
import { MemoryRouter} from 'react-router-dom';

const mockStore = configureStore([thunk]);

const auth={user: {
  permissions: {
    frontPermissions: [],
    backPermissions: [],
  },
  role: 'Manager',
  userid:'user123'
}}

const theme={darkMode:false}
const infoCollections={loading: false}

const projects=[{
  _id:'project123',
  isActive: true,
  modifiedDatetime: '2024-06-20T15:57:30.463+00:00',
  projectName: "Team Calls",
  createdDatetime: '2018-04-19T23:11:22.503+00:00',
  __v:0,
  category: "Society",
  isArchived: false}]

let store;

beforeEach(() => {
  store = mockStore({
    auth: auth,
    theme: theme,
    projectTarget: { projectId: "project123", projectName: "project name 1" },
    projectInfoModal: false,
    allProjects: { projects: [], status: 'Active', fetching: false, fetched: true },
    userProfile: { role: 'Manager' },
    popupEditor: { currPopup: { popupContent: 'project content 1' } },
    infoCollections: infoCollections,
    role: { roles: rolesMock.role.roles },
    projectMembers: { activeMemberCounts: {} }
  });
});

jest.mock('axios');

describe("Projects component",()=>{

  it('renders without crashing',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
  })
  it('check if Projects header displays as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.getAllByText('Projects')[0]).toBeInTheDocument();
  })
  it('check if Project Name header displays as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.getByText('Project Name')).toBeInTheDocument();
  })
  it('check if Category header displays as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.getByText('Category')).toBeInTheDocument();
  })
  it('check if Active header displays as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.getByText('Active')).toBeInTheDocument();
  })
  it('check if Members, WBS header displays as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('WBS')).toBeInTheDocument();
  })
  it('check if loading elements get displayed when fetched is false',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const testStore= mockStore({
      auth: auth,
      theme: theme,
      projectTarget:{projectId:"project123",projectName:"project name 1"},
      projectInfoModal: false,
      allProjects:{projects:[], status: 'Active', fetching: true, fetched: false},
      userProfile:{role:'Manager'},
      popupEditor:{currPopup:{popupContent:'project content 1'}},
      infoCollections:infoCollections,
      role: {roles: rolesMock.role.roles}
    })
    render(<Provider store={testStore}><Projects /></Provider>)
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })
  it('check if AddProject does not get displayed when postProject permission is not added',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });

    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.queryByText('Add New Project')).not.toBeInTheDocument()
  })
  it('check if AddProject gets displayed when postProject permission is added',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });

    const testAuth={user: {
      permissions: {
        frontPermissions: ['postProject', 'deleteProject','putProject'],
        backPermissions: [],
      },
      role: 'Owner',
      userid:'user123'
    }}
    const testStore= mockStore({
      auth: testAuth,
      theme: theme,
      projectTarget:{projectId:"project123",projectName:"project name 1"},
      projectInfoModal: false,
      allProjects:{projects:[], status: 'Active', fetching: true, fetched: false},
      userProfile:{role:'Owner'},
      popupEditor:{currPopup:{popupContent:'project content 1'}},
      infoCollections:infoCollections,
      role: {roles: rolesMock.role.roles}
    })

    render(<Provider store={testStore}><Projects /></Provider>)
    // expect(screen.queryByText('Add new project')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add new project/i })).toBeInTheDocument();
  })
  it('check if modal title is set to error when the modal is not open',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.getByText("ERROR")).toBeInTheDocument()
  })
  it('check if modal title is not set to error when modal is open',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });

    const testAuth={user: {
      permissions: {
        frontPermissions: ['postProject', 'deleteProject','putProject','deleteProject'],
        backPermissions: [],
      },
      role: 'Owner',
      userid:'user123'
    }}
    const testStore= mockStore({
      auth: testAuth,
      theme: theme,
      projectTarget:{projectId:"project123",projectName:"project name 1"},
      projectInfoModal: false,
      allProjects:{projects:projects, status: 'Active', fetching: true, fetched: false},
      userProfile:{role:'Owner'},
      popupEditor:{currPopup:{popupContent:'project content 1'}},
      infoCollections:infoCollections,
      role: {roles: rolesMock.role.roles}
    })

    const {container}=render(<MemoryRouter><Provider store={testStore}><Projects /></Provider></MemoryRouter>)
    expect(screen.getByText("ERROR")).toBeInTheDocument()

    const ascendingButton=container.querySelector('[id="Ascending"]')
    fireEvent.click(ascendingButton)

    // Code related to "Archive" functionality is refactored into Project component and will be tested in Project.test.js 
  //   const archiveButton=screen.getAllByText('Archive')[1]
  //   fireEvent.click(archiveButton)
    
  //   expect(screen.getByText('Confirm Archive')).toBeInTheDocument();
  //   expect(screen.getByText(`Do you want to archive ${projects[0].projectName}?`)).toBeInTheDocument();

  //   const closeButton=screen.getByText('Close')
  //   fireEvent.click(closeButton)
  //   expect(screen.queryByText('Confirm Archive')).not.toBeInTheDocument();
  })
  
})