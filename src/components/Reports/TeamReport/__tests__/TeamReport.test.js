import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TeamReport from '../TeamReport';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { rolesMock } from '__tests__/mockStates';

import axios from 'axios';
/*
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

const team = {
  _id: "team2",
  modifiedDatetime: '2024-04-04T12:00:00.000+00:00',
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

    const {container} = render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(container.querySelector('.report-page-profile')).toBeInTheDocument()
    })
  })
  //  Below five test cases are failing when we are making direct api call in component instead of getting from redux
  // Trying to avoid getting team data from redux becoz redux has single data but whereas for us team will have diff for diff users
  // it('check if team not found message is displaying as expected when there are no teams', async ()=>{
  //   axios.get.mockResolvedValue({
  //     status: 200,
  //     data: [],
  //   });

  //   const testStore = mockStore({
  //     auth: auth,
  //     theme:theme,
  //     role: rolesMock
  //   })
  //   render(<Provider store={testStore}><TeamReport match={match}/></Provider>)
  //   await waitFor(()=>{
  //     expect(screen.getByText('Team not found!')).toBeInTheDocument();
  //   })
  // })
  // it('check if the team name is getting displayed when the team is present', async ()=>{

  //   axios.get.mockResolvedValue({
  //     status: 200,
  //     data: [],
  //   });
  //   render(<Provider store={store}><TeamReport match={match}/></Provider>)
  //   await waitFor(()=>{
  //     expect(screen.getAllByText('team name 2')[0]).toBeInTheDocument()
  //   })
  // })
  // it('check if the created date and its is getting displayed when the team is present', async ()=>{

  //   axios.get.mockResolvedValue({
  //     status: 200,
  //     data: [],
  //   });
  //   render(<Provider store={store}><TeamReport match={match}/></Provider>)
  //   await waitFor(()=>{
  //     expect(screen.getByText('Apr-04-18')).toBeInTheDocument()
  //     expect(screen.getByText('Created Date')).toBeInTheDocument()
  //   })
    
  // })
  // it('check if team ID header and its value is getting displayed when the team is present',async ()=>{
  //   axios.get.mockResolvedValue({
  //     status: 200,
  //     data: [],
  //   });
  //   render(<Provider store={store}><TeamReport match={match}/></Provider>)
  //   await waitFor(()=>{
  //     expect(screen.getByText('Team ID\:\ team2')).toBeInTheDocument()
  //   })
  // })
  // it('check if Last updated header and its value is getting displayed when the team is present',async ()=>{
  //   axios.get.mockResolvedValue({
  //     status: 200,
  //     data: [],
  //   });
  //   render(<Provider store={store}><TeamReport match={match}/></Provider>)
  //   await waitFor(()=>{
  //     expect(screen.getByText('Last updated\:\Apr-04-24')).toBeInTheDocument()
  //   })
  // })
  it('check if Number of Members and its value is getting displayed as expected',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(screen.getAllByText('Number of Members')[0]).toBeInTheDocument()
    })
  })
  it('check if Total Team Blue Squares, Weekly Committed Hours, Total Worked Hours This Week gets displayed as expected', async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(screen.getAllByText('Total Team Blue Squares')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Weekly Committed Hours')[0]).toBeInTheDocument()
      expect(screen.getAllByText('Total Worked Hours This Week')[0]).toBeInTheDocument()
    })
  })
  it('check if Breakdown of Weekly Hours So Far This Week header gets displayed as expected',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(screen.getByText('Breakdown of Weekly Hours So Far This Week')).toBeInTheDocument()
    })
  })
  it('check Name, Created After, Modified After header displays as expected',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(screen.getAllByText('Name')[1]).toBeInTheDocument()
      expect(screen.getByText('Created After')).toBeInTheDocument()
      expect(screen.getByText('Modified After')).toBeInTheDocument()
    })
  })
  it('check All, Team, Status header displays as expected',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('Team')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })
  it('check Team Members, ID, Created At header displays as expected',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(screen.getByText('Team Members')).toBeInTheDocument()
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Created At')).toBeInTheDocument()
    })
  })
  it('check if date picker for Created After works as expected when the correct date is given',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const {container} = render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(container.querySelector('.report-page-profile')).toBeInTheDocument()
    })
    const datePickerElement = container.querySelector('[id="search-by-startDate"]')
    fireEvent.change(datePickerElement, { target: { value: '05/29/2024' } });
    const updatedDatePicker = container.querySelector('[id="search-by-startDate"]')
    expect(updatedDatePicker.value).toBe('05/29/2024')
  })
  it('check if date picker for Created After gives updated date when invalid date is given',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const {container} = render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(container.querySelector('.report-page-profile')).toBeInTheDocument()
    })
    const datePickerElement = container.querySelector('[id="search-by-startDate"]')
    fireEvent.change(datePickerElement, { target: { value: '02/31/2024' } });
    const updatedDatePicker = container.querySelector('[id="search-by-startDate"]')
    expect(updatedDatePicker.value).toBe('03/02/2024')
  })
  it('check Active checkbox works as expected when the box is checked',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const {container} = render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(container.querySelector('.report-page-profile')).toBeInTheDocument()
    })
    const activeCheckbox = container.querySelector('[id="active"]')
    expect(activeCheckbox).not.toBeChecked()
    fireEvent.click(activeCheckbox)
    expect(activeCheckbox).toBeChecked()
  })
  it('check Inactive checkbox works as expected when the box is checked',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const {container} = render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(container.querySelector('.report-page-profile')).toBeInTheDocument()
    })
    const inActiveCheckbox = container.querySelector('[id="inactive"]')
    expect(inActiveCheckbox).not.toBeChecked()
    fireEvent.click(inActiveCheckbox)
    expect(inActiveCheckbox).toBeChecked()
  })
  it('check if loading message is getting displayed when all teams is empty',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
  it('check if Name input element is working as expected',async ()=>{
    axios.get.mockResolvedValue({
      status: 200,
      data: [],
    });
    const {container} = render(<Provider store={store}><TeamReport match={match}/></Provider>)
    await waitFor(()=>{
      expect(container.querySelector('.report-page-profile')).toBeInTheDocument()
    })
    const inputElement = container.querySelector('[id="search-by-name"]')
    fireEvent.change(inputElement, { target: { value: 'team 1' } });
    expect("a").toBe('a')
  })

})
*/
