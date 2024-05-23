import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TeamReport from '../TeamReport';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { rolesMock } from '__tests__/mockStates';

import axios from 'axios';

const match = {params:{teamId:"team123"}}

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

let store;

const allTeams = [{
  _id: "team1",
  modifiedDatetime: '2024-04-05T01:42:33.329+00:00',
  teamName: "team name 1",
  createdDatetime: '2018-04-04T17:59:18.717+00:00',
  __v: 0,
  isActive: true,
  members:[{
    addDateTime: '2024-03-27T17:40:32.346+00:00',
    _id: 'teamMember1',
    userId: 'user123'
  }]
},
{
  _id: "team2",
  modifiedDatetime: '2024-04-05T01:42:33.329+00:00',
  teamName: "team name 2",
  createdDatetime: '2018-04-04T17:59:18.717+00:00',
  __v: 0,
  isActive: true,
  members:[]
}
]

const team = {
  _id: "team2",
  modifiedDatetime: '2024-04-05T01:42:33.329+00:00',
  teamName: "team name 2",
  createdDatetime: '2018-04-04T17:59:18.717+00:00',
  __v: 0,
  isActive: true,
  members:[]
}

beforeEach(() => {
  store = mockStore({
    auth: auth,
    theme:theme,
    team:team,
    role: rolesMock
  })
});

jest.mock('axios');

describe("Team Report component",()=>{

  it("renders without crashing", async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });

    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{})
  })
  it('check if team not found is displaying as expected when there are no teams', async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });

    const testStore = mockStore({
      auth: auth,
      theme:theme,
      role: rolesMock
    })
    render(<Provider store={testStore}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{})
    expect(screen.getByText('Team not found!')).toBeInTheDocument();
  })
  it('check if the team name is getting displayed when the team is present', async ()=>{

    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{})
    expect(screen.getAllByText('team name 2')[0]).toBeInTheDocument()
  })
  it('check if the created date and its is getting displayed when the team is present', async ()=>{

    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{})
    expect(screen.getByText('Apr-04-18')).toBeInTheDocument()
    expect(screen.getByText('Created Date')).toBeInTheDocument()
  })
  it('check if team ID header and its value is getting displayed when the team is present',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{})
    expect(screen.getByText('Team ID\:\ team2')).toBeInTheDocument()
  })
  it('check if Last updated header and its value is getting displayed when the team is present',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{})
    expect(screen.getByText('Last updated\:\Apr-04-24')).toBeInTheDocument()
  })
  it('check if Number of Members and its value is getting displayed as expected',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{})
    expect(screen.getAllByText('Number of Members')[0]).toBeInTheDocument()
  })
  it('check if Total Team Blue Squares, Weekly Committed Hours, Total Worked Hours This Week gets displayed as expected', async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{})
    expect(screen.getAllByText('Total Team Blue Squares')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Weekly Committed Hours')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Total Worked Hours This Week')[0]).toBeInTheDocument()
  })
  it('check if Breakdown of Weekly Hours So Far This Week header gets displayed as expected',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{})
    expect(screen.getByText('Breakdown of Weekly Hours So Far This Week')).toBeInTheDocument()
  })

})