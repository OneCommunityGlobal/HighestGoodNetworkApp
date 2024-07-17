import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import TeamMemberTasks from '../TeamMemberTasks';
import { rolesMock } from '__tests__/mockStates';
import { MemoryRouter } from 'react-router-dom';
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


const teamMemberTasks={isLoading:false,
                      usersWithTasks:[
                        {
                        name: 'bb',
                        personId: "user123",
                        tasks: [{
                          deadlineCount: 1,
                          dueDatetime: '2023-12-08T08:00:00.000Z',
                          estimatedHours: 20,
                          hoursBest: 20,
                          hoursLogged: 17.55,
                          hoursMost: 20,
                          hoursWorst: 20,
                          isAssigned: true,
                          num: '1',
                          projectId: 'project1234',
                          resources: [],
                          status: 'Started',
                          taskName: 'Task 1',
                          taskNotifications: [],
                          wbsId: 'wbs1234',
                          __v: 0,
                          _id: 'task11234',
                        }],
                        teams: [{teamName: 'mockTeamName', _id: 'team123'}]
                        },
                        {
                          name: 'aa',
                          personId: "user456",
                          tasks: [],
                          teams: [{teamName: 'mockTeamName', _id: 'team123'}]
                        }],
                        usersWithTimeEntries:[{personId:'user123',_id:'entry123',userProfile:[]}]
                      }
const userProfile = {
  _id: 'user123',
  role: 'Manager',
  startDate: '2023-12-08T08:00:00.000Z'
};
const timeOffRequests={onTimeOff:false, goingOnTimeOff:false}

const theme={darkMode:false}

const store = mockStore({
  auth: auth,
  teamMemberTasks: teamMemberTasks,
  userProfile: userProfile,
  theme:theme,
  timeOffRequests:timeOffRequests,
  infoCollections:{loading:false},
  role: rolesMock
})

jest.mock('axios');

describe("TeamMemberTasks component",()=>{

  it('renders without crashing',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
  })
  it('check if Team Member Tasks header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    expect(screen.getByText('Team Member Tasks')).toBeInTheDocument()
  })
  it('check if Team Member header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    expect(screen.getByText('Team Member')).toBeInTheDocument()
  })
  it('check if Weekly Committed Hours header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    expect(screen.getByText('Weekly Committed Hours')).toBeInTheDocument()
  })
  it('check if Total Hours Completed this Week header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    expect(screen.getByText('Total Hours Completed this Week')).toBeInTheDocument()
  })
  it('check if Total Remaining Hours header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    expect(screen.getByText('Total Remaining Hours')).toBeInTheDocument()
  })
  it('check if Tasks(s) header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    expect(screen.getByText('Tasks(s)')).toBeInTheDocument()
  })
  it('check if Progress header is displaying as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
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
    const {container}=render(<Provider store={testStore}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    const skeletonLoadingElement=container.querySelector('.skeleton-loading-team-member-tasks-row')
    expect(skeletonLoadingElement).toBeInTheDocument()

  })
  it('check if the skeleton loading html elements are not shown when isLoading is false',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });

    const {container}=render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    const skeletonLoadingElement=container.querySelector('.skeleton-loading-team-member-tasks-row')
    expect(skeletonLoadingElement).not.toBeInTheDocument()
  })
  it('check if class names does not include color when dark mode is false',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });

    const {container}=render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
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
      infoCollections:{loading:false},
      role: rolesMock
    })

    const {container}=render(<Provider store={testStore}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
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
  it('check if show time off button works as expected',()=>{

    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    const {container}=render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    const buttonElement=container.querySelector('[class="show-time-off-btn show-time-off-btn-selected "]')
    expect(container.querySelector('[class="show-time-off-calender-svg "]')).not.toBeInTheDocument()
    expect(container.querySelector('[class="show-time-off-icon "]')).not.toBeInTheDocument()
    expect(container.querySelector('[class="show-time-off-calender-svg show-time-off-calender-svg-selected"]')).toBeInTheDocument()
    expect(container.querySelector('[class="show-time-off-icon show-time-off-icon-selected"]')).toBeInTheDocument()
    fireEvent.click(buttonElement)
    const iconElement=container.querySelector('[class="show-time-off-calender-svg "]')
    expect(iconElement).toBeInTheDocument()
    const newIconElement=container.querySelector('[class="show-time-off-icon "]')
    expect(newIconElement).toBeInTheDocument()
  })
  it('check if days button works as expected',()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    const {container}=render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    const buttonElement=container.querySelector('[class="circle-border 1 days "]')
    const daysButton=container.querySelector('[style="color: rgb(34, 139, 34); background-color: white; border: 1px solid #228b22;"]')
    expect(daysButton).toBeInTheDocument()
    fireEvent.click(buttonElement)
    const newDaysButton=container.querySelector('[style="color: white; background-color: rgb(34, 139, 34); border: 1px solid #228b22;"]')
    expect(newDaysButton).toBeInTheDocument()
  })
  it("check if TeamMemberTask without time entries gets displayed when isTimeFilterActive is set to False",()=>{

    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    const {container}=render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    expect(container.querySelector('[className="table-row"]')).not.toBeInTheDocument()

  })
  it("check if TeamMemberTask with time entries gets displayed when isTimeFilterActive is set to True",()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    const {container}=render(<Provider store={store}><MemoryRouter><TeamMemberTasks /></MemoryRouter></Provider>)
    const buttonElement=container.querySelector('[class="circle-border 1 days "]')
    fireEvent.click(buttonElement)
    expect(container.querySelector('[class="table-row"]')).toBeInTheDocument()

  })

})