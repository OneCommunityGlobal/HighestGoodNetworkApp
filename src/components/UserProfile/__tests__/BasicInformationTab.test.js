
import {Name, Title, Email, formatPhoneNumber , Phone, TimeZoneDifference,   BasicInformationTab} from '../BasicInformationTab/BasicInformationTab';
import { render, screen, fireEvent,   waitFor, act } from '@testing-library/react';
import { toast } from 'react-toastify';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
// import hasPermission from 'utils/permissions';
// import { propTypes } from 'react-bootstrap/esm/Image';






jest.mock('../UserProfileEdit/ToggleSwitch', () => (props) => <div data-testid="toggleswitch">{props.id}</div>);
jest.mock('react-phone-input-2', () => (props) => <div data-testid="phoneinput">{props.id}</div>);

/*
// describe('Test Suite for Name component', () => {
//    let testProps= {
//     userProfile: { firstName: 'John', lastName: 'Doe' },
//     setUserProfile: jest.fn(),
//     formValid: { firstName: true, lastName: true },
//     setFormValid: jest.fn(),
//     canEdit: true,
//     desktopDisplay: 3,
//   };
//   it('Test case 1 : Name component renders with editable fields when canEdit is true ', () => {
//     render(<Name {...testProps} />);
//     const firstNameField=screen.queryByTestId('firstName');
//     expect(firstNameField).toBeInTheDocument();
//     const lastNameField=screen.queryByTestId('lastName');
//     expect(lastNameField).toBeInTheDocument();
//   });

//   it('Test case 2 : Name component renders non-editable fields when canEdit is false ', () => {
//     testProps.canEdit = false;
//     render(<Name {...testProps} />);
//     expect(screen.queryByTestId('firstName')).not.toBeInTheDocument();
//     expect(screen.queryByTestId('lastName')).not.toBeInTheDocument();
//     expect(screen.queryByText(testProps.userProfile.firstName+' '+testProps.userProfile.lastName)).toBeInTheDocument();
//   });


//   it('Test case 3 : setUserProfile handle is called when  the First Name  changes', () => {
//     testProps.canEdit = true;
//     render(<Name {...testProps} />);
//     const firstNameField=screen.queryByTestId('firstName');
//     fireEvent.change(firstNameField, { target: { value: 'Jane' } });
//     expect(testProps.setUserProfile).toHaveBeenCalledWith({ ...testProps.userProfile, firstName: 'Jane' });
//   });

//   it('Test case 4 : setUserProfile handle is called  when  the Last Name  changes', () => {
//     render(<Name {...testProps} />);
//     const firstNameField=screen.queryByTestId('lastName');
//     fireEvent.change(firstNameField, { target: { value: 'Fletcher' } });
//     expect(testProps.setUserProfile).toHaveBeenCalledWith({ ...testProps.userProfile, lastName: 'Fletcher' });
//   });
//   it('Test case 5 : Verify error message is displayed for an empty Last Name', () => {
//     render(<Name {...testProps} />);
//     const firstNameField=screen.queryByTestId('lastName');
//     fireEvent.change(firstNameField, { target: { value: '' } });
//     expect(screen.queryByText("Last Name Can't be empty")).toBeInTheDocument();
//   });
//   it('Test case 6 : Verify error message is displayed for an empty First Name', () => {
//     render(<Name {...testProps} />);
//     const firstNameField=screen.queryByTestId('firstName');
//     fireEvent.change(firstNameField, { target: { value: '' } });
//     expect(screen.queryByText("First Name Can't be empty")).toBeInTheDocument();
//   });
// });

// describe('Test Suite for Title component', () => {
//   let testProps= {
//    userProfile: { jobTitle: 'volunteer'},
//    setUserProfile: jest.fn(),
//    canEdit: true,
//    desktopDisplay: 3,
//  };
//  it('Test case 1 : Title component renders with editable fields when canEdit is true ', () => {
//    render(<Title {...testProps} />);
//    const jobTitleField=screen.queryByTestId('jobTitle');
//    expect(jobTitleField).toBeInTheDocument();
   
//  });

//  it('Test case 2 : Title component renders non-editable fields when canEdit is false ', () => {
//    testProps.canEdit = false;
//    render(<Title {...testProps} />);
//    expect(screen.queryByTestId('jobTitle')).not.toBeInTheDocument();
//    expect(screen.queryByText(testProps.userProfile.jobTitle)).toBeInTheDocument();
//  });


//  it('Test case 3 : setUserProfile handle is called when  the job title  changes', () => {
//    testProps.canEdit = true;
//    render(<Title {...testProps} />);
//    const jobTitleField=screen.queryByTestId('jobTitle');
//    fireEvent.change(jobTitleField, { target: { value: 'Admin' } });
//    expect(testProps.setUserProfile).toHaveBeenCalledWith({ ...testProps.userProfile, jobTitle: 'Admin' });
//  });

// });


/******************************************************************** */
// describe('Test Suite for Email component', () => {
//   let testProps= {
//    userProfile: { email: 'volunteer@gmail.com', privacySettings:{email :true}, emailSubscriptions:true},
//    setUserProfile: jest.fn(),
//    formValid: { email: true },
//    setFormValid: jest.fn(),
//    canEdit: true,
//    desktopDisplay: true,
//    handleUserProfile:jest.fn(),
//  };

//  it('Test case 1 : Email component renders with editable fields when canEdit is true ', () => {
//   render(<Email {...testProps} />);
//    const emailInputField=screen.queryByTestId('email');
//    expect(emailInputField).toBeInTheDocument();
//    const privacyToggle=screen.queryByText('emailPrivacy');
//    expect(privacyToggle).toBeInTheDocument();
//    const subscriptionToggle=screen.queryByText('emailSubscription');
//    expect(subscriptionToggle).toBeInTheDocument();
   
//  });

//  it('Test case 2 : Email component renders non-editable fields when canEdit is false ', () => {
//    testProps.canEdit = false;
//    render(<Email {...testProps} />);

//    expect(screen.queryByTestId('email')).not.toBeInTheDocument();
//    expect(screen.queryByTestId('emailPrivacy')).not.toBeInTheDocument();
//    expect(screen.queryByTestId('emailSubscription')).not.toBeInTheDocument();
//    expect(screen.queryByText(testProps.userProfile.email)).toBeInTheDocument();
//  });


//  it('Test case 3 : setUserProfile handle is called when the email changes', () => {
//    testProps.canEdit = true;
//    render(<Email {...testProps} />);
//    const emailField=screen.queryByTestId('email');
//    fireEvent.change(emailField, { target: { value: 'test@gmail.com' } });
//    expect(testProps.setUserProfile).toHaveBeenCalledWith({ ...testProps.userProfile, email: 'test@gmail.com' });

//  });

//  it('Test case 4 : setFormValid handle is called when  the email value changes', () => {
//   render(<Email {...testProps} />);
//   const emailField=screen.queryByTestId('email');
//   fireEvent.change(emailField, { target: { value: 'test@gmail.com' } });
//   expect(testProps.setFormValid).toHaveBeenCalledWith({ ...testProps.userProfile.formValid, email :true});

// });

// it('Test case 5 : Verify  if email is not displayed if privacy settings is falsey ', () => {
//   testProps= {
//     userProfile: { email: 'volunteer@gmail.com', emailSubscriptions:true},
//     setUserProfile: jest.fn(),
//     formValid: { email: true },
//     setFormValid: jest.fn(),
//     canEdit: true,
//     desktopDisplay: true,
//     handleUserProfile:jest.fn(),
//   };  render(<Email {...testProps} />);
  
//   expect(screen.queryByText(testProps.userProfile.email)).not.toBeInTheDocument();

//   expect(screen.queryByText("Email is not Valid")).toBeInTheDocument();

// });

// });

/***************************************************************************** */
// describe(' Test Suite for formatPhoneNumber', () => {
//   it('Test case 1 : Formats a domestic (USA) phone number', () => {
//     expect(formatPhoneNumber("1234567890")).toBe("( 123 ) 456 - 7890");
//   });

//   it('Test case 2 : Formats an international phone number', () => {
//     expect(formatPhoneNumber("+11234567890")).toBe("+1( 123 ) 456 - 7890");
//   });

//   it('Test case 3 : Returns unconventional phone number (less than 10 digits) as is', () => {
//     expect(formatPhoneNumber("12345")).toBe("12345");
//   });

//   it('Test case 4 : Returns unconventional phone number (more than 11 digits) as is', () => {
//     expect(formatPhoneNumber("123456789012")).toBe("123456789012");
//   });

//   it('Test case 5 : Formats phone number with non-numeric characters', () => {
//     expect(formatPhoneNumber("123-456-7890")).toBe("( 123 ) 456 - 7890");
//   });

//   it('Test case 6 : Formats phone number with leading or trailing whitespace', () => {
//     expect(formatPhoneNumber("  1234567890  ")).toBe("( 123 ) 456 - 7890");
//   });
// });

/*************************************************************** */
// describe('Test Suite for Phone component', () => {
//   let testProps= {
//    userProfile: { phoneNumber:"123456789", privacySettings:{email :true}},
//    setUserProfile: jest.fn(),
//    formValid: { email: true },
//    setFormValid: jest.fn(),
//    canEdit: true,
//    desktopDisplay: true,
//    handleUserProfile:jest.fn(),
//  };

//  it('Test case 1 : Phone component renders with editable fields when canEdit is true ', () => {
//   render(<Phone {...testProps} />);
//    const phInputStyle=screen.queryByText('ph-input-style');
//    expect(phInputStyle).toBeInTheDocument();
//    const phoneToggle=screen.queryByText('phone');
//    expect(phoneToggle).toBeInTheDocument();
  
//  });

//  it('Test case 2 : Phone component renders non-editable fields when canEdit is false ', () => {
//    testProps.canEdit = false;
//    render(<Phone {...testProps} />);
//    expect(screen.queryByText('ph-input-style')).not.toBeInTheDocument();
//    expect(screen.queryByText('phone')).not.toBeInTheDocument();
//  });



// it('Test case 3 : Verify  if phone number  is not displayed if privacy settings and phone is falsey ', () => {
//   testProps= {
//     userProfile: {phoneNumber:'123456789'},
//     setUserProfile: jest.fn(),
//     formValid: { email: true },
//     setFormValid: jest.fn(),
//     canEdit: true,
//     desktopDisplay: true,
//     handleUserProfile:jest.fn(),
//   };  render(<Email {...testProps} />);
  
//   expect(screen.queryByText((testProps.userProfile.phoneNumber).trim())).not.toBeInTheDocument();

// });

// });

/******************************************************** */

// jest.mock('react-toastify', () => ({
//   toast: {
//     error: jest.fn(),
//   },
// }));

// describe('Test suite for TimeZoneDifference component ', () => {
//   beforeEach(() => {
//     jest.useFakeTimers(); // Mock timers
//   });

//   afterEach(() => {
//     jest.runOnlyPendingTimers();
//     jest.useRealTimers();
//   });


//   let testProps = {
//     isUserSelf: false,
//     errorOccurred: false,
//     setErrorOccurred: jest.fn(),
//     desktopDisplay: true,
//     userProfile: {
//       timeZone: 'America/New_York',
//     },
//   };

 

//   it('Test case 1 : Renders "This is your own profile page" when user is self', () => {
//     testProps.isUserSelf=true;
//     render(<TimeZoneDifference {...testProps} />);
//     expect(screen.getByText('This is your own profile page')).toBeInTheDocument();
//   });

//   it('Test case 2 : Renders timezone offset when user is not self', () => {
//     testProps.isUserSelf=false;
//     render(<TimeZoneDifference {...testProps} />);
//     expect(screen.getByText(/[-+]\d+ hours/)).toBeInTheDocument(); 
//   });

//   it('Test case 3 : Renders error message if the component has encountered error for the first time ',()=>{
//      testProps = {
//       isUserSelf: false,
//       errorOccurred: false,
//       setErrorOccurred: jest.fn(),
//       desktopDisplay: true,
//       userProfile: {
//         timeZone: 'Invalid/Timezone',
//       },    };
//     render(<TimeZoneDifference {...testProps} />);
//     jest.runAllTimers(); 
//     expect(toast.error).toHaveBeenCalledWith('Error occurred while trying to calculate offset between timezones');
//   });


//   it('Test case 4 : Does not render error message if the component has not encountered error for the first time ',()=>{
//    testProps.errorOccurred=true;
//     render(<TimeZoneDifference {...testProps} />);
//     jest.runAllTimers(); 
//     expect(toast.error).not.toHaveBeenCalledWith('Error occurred while trying to calculate offset between timezones');
//   });

//   it('Test case 5 : verify if the timezone difference calculation works correctly ',()=>{
//     testProps.userProfile.timeZone='America/New_York';
//     render(<TimeZoneDifference {...testProps} />);
//     expect(screen.getByText(/[-+]3+ hours/)).toBeInTheDocument(); 
//     testProps.userProfile.timeZone='Europe/London';
//     render(<TimeZoneDifference {...testProps} />);
//     expect(screen.getByText(/[-+]8+ hours/)).toBeInTheDocument(); 

//   });

// });
/*********************************************************************** */
const hasPermission = jest.fn();

const mockStore = configureStore([thunk]);
const initialState = {
  auth: {
    user: {
      permissions: {
        frontPermissions: ['addDeleteEditOwners'],
        backPermissions: [],
      },
      role: 'Volunteer',
    },
  },
  userProfile: {
    userProfile: { firstName: 'John', lastName: 'Doe' , collaborationPreference: 'video'},

  },
  role: mockAdminState.role,
};




let testProps = {
  userProfile: { firstName: 'John', lastName: 'Doe' , collaborationPreference: 'video'},
  setUserProfile: jest.fn(),
  formValid: { firstName: true, lastName: true },
  setFormValid: jest.fn(),
  canEdit: true,
  desktopDisplay: 3,
};

let store;

describe('BasicInformationTab component', () => {
  beforeEach(() => {
    store = mockStore(initialState);
  });
  afterEach(() => {
    store.clearActions();
  });
  
  it('Basic Rendering', () => {
    render(
      <Provider store={store}>
        <BasicInformationTab
          {...testProps} hasPermission={hasPermission}
         />
       </Provider>,
    );
  
  });
});

