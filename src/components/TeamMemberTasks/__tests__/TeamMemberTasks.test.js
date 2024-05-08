import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import TeamMemberTasks from '../TeamMemberTasks';
import axios from 'axios';

const mockStore = configureStore([thunk]);

const auth={user: {
  permissions: {
    frontPermissions: [],
    backPermissions: [],
  },
  role: 'Manager',
  userid:'user123'
}}


const teamMemberTasks={isLoading:false,usersWithTasks:[],usersWithTimeEntries:[]}
const userProfile = {
  _id: 'user123',
  role: 'Manager',
};
const timeOffRequests={onTimeOff:false, goingOnTimeOff:false}

const theme={darkMode:false}

const store = mockStore({
  auth: auth,
  teamMemberTasks: teamMemberTasks,
  userProfile: userProfile,
  theme:theme,
  timeOffRequests:timeOffRequests,
  infoCollections:{loading:false}
})

jest.mock('axios');

describe("TeamMemberTasks component",()=>{

  it('renders without crashing',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><TeamMemberTasks /></Provider>)
    
  })
  it('check if Team Member Tasks header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><TeamMemberTasks /></Provider>)
    expect(screen.getByText('Team Member Tasks')).toBeInTheDocument()
  })
  it('check if Team Member header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><TeamMemberTasks /></Provider>)
    expect(screen.getByText('Team Member')).toBeInTheDocument()
  })
  it('check if Weekly Committed Hours header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><TeamMemberTasks /></Provider>)
    expect(screen.getByText('Weekly Committed Hours')).toBeInTheDocument()
  })
  it('check if Total Hours Completed this Week header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><TeamMemberTasks /></Provider>)
    expect(screen.getByText('Total Hours Completed this Week')).toBeInTheDocument()
  })
  it('check if Total Remaining Hours header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><TeamMemberTasks /></Provider>)
    expect(screen.getByText('Total Remaining Hours')).toBeInTheDocument()
  })
  it('check if Tasks(s) header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><TeamMemberTasks /></Provider>)
    expect(screen.getByText('Tasks(s)')).toBeInTheDocument()
  })
  it('check if Progress header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><TeamMemberTasks /></Provider>)
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })
  it('check if the skeleton loading html elements are shown when isLoading is true',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    const newTeamMemberTasks={isLoading:true,usersWithTasks:[],usersWithTimeEntries:[]}
    const testStore = mockStore({
      auth: auth,
      teamMemberTasks: newTeamMemberTasks,
      userProfile: userProfile,
      theme:theme,
      timeOffRequests:timeOffRequests,
      infoCollections:{loading:false}
    })
    const {container}=render(<Provider store={testStore}><TeamMemberTasks /></Provider>)
    const skeletonLoadingElement=container.querySelector('.skeleton-loading-team-member-tasks-row')
    expect(skeletonLoadingElement).toBeInTheDocument()

  })
  it('check if the skeleton loading html elements are not shown when isLoading is false',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    
    const {container}=render(<Provider store={store}><TeamMemberTasks /></Provider>)
    const skeletonLoadingElement=container.querySelector('.skeleton-loading-team-member-tasks-row')
    expect(skeletonLoadingElement).not.toBeInTheDocument()
  })
  it('check if class names does not include color when dark mode is false',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    
    const {container}=render(<Provider store={store}><TeamMemberTasks /></Provider>)
    const darkModeElement=container.querySelector('.container.team-member-tasks')
    const timeOffElement=container.querySelector('.show-time-off-btn.show-time-off-btn-selected ')
    const hoursCompletedElement=container.querySelector('.team-member-tasks-subtable')
    const oneDayElement=container.querySelector('[class="circle-border 1 days "]')
    const twoDayElement=container.querySelector('[class="circle-border 2 days "]')
    const threeDayElement=container.querySelector('[class="circle-border 3 days "]')
    const fourDayElement=container.querySelector('[class="circle-border 4 days "]')
    const sevenDayElement=container.querySelector('[class="circle-border 7 days "]')
    expect(darkModeElement).toBeInTheDocument()
    expect(hoursCompletedElement).toBeInTheDocument()
    expect(timeOffElement).toBeInTheDocument()
    expect(oneDayElement).toBeInTheDocument()
    expect(twoDayElement).toBeInTheDocument()
    expect(threeDayElement).toBeInTheDocument()
    expect(fourDayElement).toBeInTheDocument()
    expect(sevenDayElement).toBeInTheDocument()
  })
  it('check if class names does include color when dark mode is true',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });

    const theme={darkMode:true}

    const testStore = mockStore({
      auth: auth,
      teamMemberTasks: teamMemberTasks,
      userProfile: userProfile,
      theme:theme,
      timeOffRequests:timeOffRequests,
      infoCollections:{loading:false}
    })
    
    const {container}=render(<Provider store={testStore}><TeamMemberTasks /></Provider>)
    const darkModeElement=container.querySelector('.container.team-member-tasks')
    const timeOffElement=container.querySelector('.show-time-off-btn.show-time-off-btn-selected ')
    const hoursCompletedElement=container.querySelector('.team-member-tasks-subtable')
    const oneDayElement=container.querySelector('[class="circle-border 1 days box-shadow-dark"]')
    const twoDayElement=container.querySelector('[class="circle-border 2 days box-shadow-dark"]')
    const threeDayElement=container.querySelector('[class="circle-border 3 days box-shadow-dark"]')
    const fourDayElement=container.querySelector('[class="circle-border 4 days box-shadow-dark"]')
    const sevenDayElement=container.querySelector('[class="circle-border 7 days box-shadow-dark"]')
    expect(darkModeElement).toBeInTheDocument()
    expect(hoursCompletedElement).toBeInTheDocument()
    expect(timeOffElement).toBeInTheDocument()
    expect(oneDayElement).toBeInTheDocument()
    expect(twoDayElement).toBeInTheDocument()
    expect(threeDayElement).toBeInTheDocument()
    expect(fourDayElement).toBeInTheDocument()
    expect(sevenDayElement).toBeInTheDocument()
  })

})