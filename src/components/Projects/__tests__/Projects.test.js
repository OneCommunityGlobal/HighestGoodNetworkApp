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
  isArchived: false},{
    _id:'project456',
    isActive: true,
    modifiedDatetime: '2024-06-20T15:57:30.463+00:00',
    projectName: "New Team Calls",
    createdDatetime: '2018-04-19T23:11:22.503+00:00',
    __v:0,
    category: "Stewardship",
    isArchived: false}, {
      _id:'project789',
      isActive: false,
      modifiedDatetime: '2024-06-20T15:57:30.463+00:00',
      projectName: "New Team Calls 2",
      createdDatetime: '2018-04-19T23:11:22.503+00:00',
      __v:0,
      category: "Stewardship",
      isArchived: false}]

let store;

beforeEach(() => {
  store = mockStore({
    auth: auth,
    theme: theme,
    projectTarget:{projectId:"project123",projectName:"project name 1"},
    projectInfoModal: false,
    allProjects:{projects:[], status: 'Active', fetching: false, fetched: true},
    userProfile:{role:'Manager'},
    popupEditor:{currPopup:{popupContent:'project content 1'}},
    infoCollections:infoCollections,
    role: {roles: rolesMock.role.roles}

  })
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
  it('check is AddProjects html elements are not present when user does not have postProject permission',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.queryByText('input-group-prepend')).not.toBeInTheDocument()
  })
    
  it('check if AddProjects html elements get displayed when postProject permission is set',()=>{
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
      allProjects:{projects:[], status: 'Active', fetching: false, fetched: true},
      userProfile:{role:'Owner'},
      popupEditor:{currPopup:{popupContent:'project content 1'}},
      infoCollections:infoCollections,
      role: {roles: rolesMock.role.roles}
    })
    const {container}=render(<Provider store={testStore}><Projects /></Provider>)
    expect(container.querySelector('.input-group-prepend')).toBeInTheDocument()
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
  it('check if delete modal is closed when showModalDelete is set to false',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  })
  it('check if delete modal is open when showModalDelete is set to true',()=>{
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
    const newTestStore= mockStore({
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
    render(<MemoryRouter><Provider store={newTestStore}><Projects /></Provider></MemoryRouter>)
    const deleteButton=screen.getAllByText('Delete')[1]
    fireEvent.click(deleteButton)
    const modalElement=screen.getByRole("dialog")
    expect(modalElement).toBeInTheDocument();

    expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    expect(screen.getByText("project content 1")).toBeInTheDocument();
  })
  it('check if message modal is closed when showModalMsg is set to false',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><Projects /></Provider>)
    expect(screen.queryByRole('document')).not.toBeInTheDocument()
  })
  it('check if message modal is open when showModalMsg is set to true',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data:[]
    });
    axios.post.mockResolvedValue({
      status: 200,
      data: {_id:"project123",status:200},
    });
    const testAuth={user: {
      permissions: {
        frontPermissions: ['postProject', 'deleteProject','putProject'],
        backPermissions: [],
      },
      role: 'Owner',
      userid:'user123'
    }}
    const newTestStore= mockStore({
      auth: testAuth,
      theme: theme,
      projectTarget:{projectId:"project123",projectName:"project name 1"},
      projectInfoModal: false,
      allProjects:{projects:projects, status: 400, fetching: true, fetched: false},
      userProfile:{role:'Owner'},
      popupEditor:{currPopup:{popupContent:'project content 1'}},
      infoCollections:infoCollections,
      role: {roles: rolesMock.role.roles}
    })
    const {container}=render(<MemoryRouter><Provider store={newTestStore}><Projects /></Provider></MemoryRouter>)
    const newProjectNameElement=container.querySelector('[placeholder="Project Name (required) type to add."]')
    fireEvent.change(newProjectNameElement,{target:{value:"new project name"}})
    const plusElement=container.querySelector('[class="fa fa-plus"]')
    fireEvent.click(plusElement)
    const modalElement=screen.getByRole("dialog")
    expect(modalElement).toBeInTheDocument();
    expect(screen.getByText('Notice')).toBeInTheDocument();
    expect(screen.getByText('This project name is already taken')).toBeInTheDocument()
  })
  it('check if active projects are getting displayed as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const testStore= mockStore({
      auth: auth,
      theme: theme,
      projectTarget:{projectId:"project123",projectName:"project name 1"},
      projectInfoModal: false,
      allProjects:{projects:projects, status: 'Active', fetching: true, fetched: false},
      userProfile:{role:'Manager'},
      popupEditor:{currPopup:{popupContent:'project content 1'}},
      infoCollections:infoCollections,
      role: {roles: rolesMock.role.roles}
    })
    const {container}=render(<MemoryRouter><Provider store={testStore}><Projects /></Provider></MemoryRouter>)
    expect(screen.getByText('Team Calls')).toBeInTheDocument();
    expect(screen.getByText('Society')).toBeInTheDocument();
    const activeElement = container.querySelector('[class="isActive"]')
    const colorElement=activeElement.querySelector('[class="fa fa-circle"]')
    const attributeElement=colorElement.getAttribute('color')
    expect(attributeElement).not.toBe('#dee2e6')
  })
  it('check if inactive projects are getting displayed as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const testStore= mockStore({
      auth: auth,
      theme: theme,
      projectTarget:{projectId:"project123",projectName:"project name 1"},
      projectInfoModal: false,
      allProjects:{projects:projects, status: 'Active', fetching: true, fetched: false},
      userProfile:{role:'Manager'},
      popupEditor:{currPopup:{popupContent:'project content 1'}},
      infoCollections:infoCollections,
      role: {roles: rolesMock.role.roles}
    })
    const {container}=render(<MemoryRouter><Provider store={testStore}><Projects /></Provider></MemoryRouter>)
    expect(screen.getByText('New Team Calls 2')).toBeInTheDocument();
    expect(screen.getAllByText('Stewardship')[0]).toBeInTheDocument();
    const inactiveElement = container.querySelector('[class="isNotActive"]')
    const colorElement=inactiveElement.querySelector('[class="fa fa-circle"]')
    const attributeElement=colorElement.getAttribute('color')
    expect(attributeElement).toBe('#dee2e6')
  })
  
})