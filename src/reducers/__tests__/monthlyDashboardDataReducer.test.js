import { monthlyDashboardDataReducer } from '../monthlyDashboardDataReducer';

const monthlyDashboardData = {
  projectName: "",
  timeSpent_hrs: 0,
}

describe('Monthly Dashboard Data Reducer', () => {

  it('get monthly dashboard data', () => {

    const newPayload = { projectName: 'Project Name', timeSpent_hrs : '0' };

    const action = {
      type: 'GET_MONTHLY_DASHBOARD_DATA',
      payload: newPayload,
    };

    const result = monthlyDashboardDataReducer(monthlyDashboardData, action );
    expect(result).toEqual(newPayload);
      
  });

  it('should return the initial state when an action type is not passed', () => {

    const result = monthlyDashboardDataReducer(monthlyDashboardData, {} );
    expect(result).toEqual(monthlyDashboardData);
      
  });

  it('should return null as the initial state', () => {

    const result = monthlyDashboardDataReducer(undefined, {} );
    expect(result).toBeNull();

  });

  it('should return previous state if action type is unknown', () => { 
    const action = { 
        type: 'UNKNOWN_ACTION', 
        payload: { projectName: 'Project Name', timeSpent_hrs : '0' } 
    }; 

    const result = monthlyDashboardDataReducer(monthlyDashboardData, action);
    expect(result).toEqual(monthlyDashboardData); 
  });

})