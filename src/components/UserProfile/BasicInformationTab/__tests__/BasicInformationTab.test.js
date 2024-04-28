
import {Name, Title, Email, formatPhoneNumber , Phone, TimeZoneDifference} from '../BasicInformationTab';
import BasicInformationTab from '../BasicInformationTab';
import { render, screen, fireEvent,   waitFor, act } from '@testing-library/react';
import { toast } from 'react-toastify';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import mockAdminState from '__tests__/mockAdminState';


// Mock components 
jest.mock('../../UserProfileEdit/ToggleSwitch', () => (props) => <div data-testid="toggleswitch">{props.id}</div>);
jest.mock('react-phone-input-2', () => (props) => <div data-testid="phoneinput">{props.id}</div>);
jest.mock('../../EditableModal/EditableInfoModal', () => () => <div data-testid="editablemodel">RoleInfo</div>);


//Test Suites 
describe('Test Suite for Name component', () => {
   let testProps= {
    userProfile: { firstName: 'John', lastName: 'Doe' },
    setUserProfile: jest.fn(),
    formValid: { firstName: true, lastName: true },
    setFormValid: jest.fn(),
    canEdit: true,
    desktopDisplay: 3,
  };
  it('Test case 1 : Name component renders with editable fields when canEdit is true ', () => {
    render(<Name {...testProps} />);
    const firstNameField=screen.queryByTestId('firstName');
    expect(firstNameField).toBeInTheDocument();
    const lastNameField=screen.queryByTestId('lastName');
    expect(lastNameField).toBeInTheDocument();
  });

  it('Test case 2 : Name component renders non-editable fields when canEdit is false ', () => {
    testProps.canEdit = false;
    render(<Name {...testProps} />);
    expect(screen.queryByTestId('firstName')).not.toBeInTheDocument();
    expect(screen.queryByTestId('lastName')).not.toBeInTheDocument();
    expect(screen.queryByText(testProps.userProfile.firstName+' '+testProps.userProfile.lastName)).toBeInTheDocument();
  });


  it('Test case 3 : setUserProfile handle is called when  the First Name  changes', () => {
    testProps.canEdit = true;
    render(<Name {...testProps} />);
    const firstNameField=screen.queryByTestId('firstName');
    fireEvent.change(firstNameField, { target: { value: 'Jane' } });
    expect(testProps.setUserProfile).toHaveBeenCalledWith({ ...testProps.userProfile, firstName: 'Jane' });
  });

  it('Test case 4 : setUserProfile handle is called  when  the Last Name  changes', () => {
    render(<Name {...testProps} />);
    const firstNameField=screen.queryByTestId('lastName');
    fireEvent.change(firstNameField, { target: { value: 'Fletcher' } });
    expect(testProps.setUserProfile).toHaveBeenCalledWith({ ...testProps.userProfile, lastName: 'Fletcher' });
  });
  it('Test case 5 : Verify error message is displayed for an empty Last Name', () => {
    render(<Name {...testProps} />);
    const firstNameField=screen.queryByTestId('lastName');
    fireEvent.change(firstNameField, { target: { value: '' } });
    expect(screen.queryByText("Last Name Can't be empty")).toBeInTheDocument();
  });
  it('Test case 6 : Verify error message is displayed for an empty First Name', () => {
    render(<Name {...testProps} />);
    const firstNameField=screen.queryByTestId('firstName');
    fireEvent.change(firstNameField, { target: { value: '' } });
    expect(screen.queryByText("First Name Can't be empty")).toBeInTheDocument();
  });
});

/****************************************************** */

describe('Test Suite for Title component', () => {
  let testProps= {
   userProfile: { jobTitle: 'volunteer'},
   setUserProfile: jest.fn(),
   canEdit: true,
   desktopDisplay: 3,
 };
 it('Test case 1 : Title component renders with editable fields when canEdit is true ', () => {
   render(<Title {...testProps} />);
   const jobTitleField=screen.queryByTestId('jobTitle');
   expect(jobTitleField).toBeInTheDocument();
   
 });

 it('Test case 2 : Title component renders non-editable fields when canEdit is false ', () => {
   testProps.canEdit = false;
   render(<Title {...testProps} />);
   expect(screen.queryByTestId('jobTitle')).not.toBeInTheDocument();
   expect(screen.queryByText(testProps.userProfile.jobTitle)).toBeInTheDocument();
 });


 it('Test case 3 : setUserProfile handle is called when  the job title  changes', () => {
   testProps.canEdit = true;
   render(<Title {...testProps} />);
   const jobTitleField=screen.queryByTestId('jobTitle');
   fireEvent.change(jobTitleField, { target: { value: 'Admin' } });
   expect(testProps.setUserProfile).toHaveBeenCalledWith({ ...testProps.userProfile, jobTitle: 'Admin' });
 });

});


/******************************************************************** */
describe('Test Suite for Email component', () => {
  let testProps= {
   userProfile: { email: 'volunteer@gmail.com', privacySettings:{email :true}, emailSubscriptions:true},
   setUserProfile: jest.fn(),
   formValid: { email: true },
   setFormValid: jest.fn(),
   canEdit: true,
   desktopDisplay: true,
   handleUserProfile:jest.fn(),
 };

 it('Test case 1 : Email component renders with editable fields when canEdit is true ', () => {
  render(<Email {...testProps} />);
   const emailInputField=screen.queryByTestId('email');
   expect(emailInputField).toBeInTheDocument();
   const privacyToggle=screen.queryByText('emailPrivacy');
   expect(privacyToggle).toBeInTheDocument();
   const subscriptionToggle=screen.queryByText('emailSubscription');
   expect(subscriptionToggle).toBeInTheDocument();
   
 });

 it('Test case 2 : Email component renders non-editable fields when canEdit is false ', () => {
   testProps.canEdit = false;
   render(<Email {...testProps} />);

   expect(screen.queryByTestId('email')).not.toBeInTheDocument();
   expect(screen.queryByText('emailPrivacy')).not.toBeInTheDocument();
   expect(screen.queryByText('emailSubscription')).not.toBeInTheDocument();
   expect(screen.queryByText(testProps.userProfile.email)).toBeInTheDocument();
 });


 it('Test case 3 : setUserProfile handle is called when the email changes', () => {
   testProps.canEdit = true;
   render(<Email {...testProps} />);
   const emailField=screen.queryByTestId('email');
   fireEvent.change(emailField, { target: { value: 'test@gmail.com' } });
   expect(testProps.setUserProfile).toHaveBeenCalledWith({ ...testProps.userProfile, email: 'test@gmail.com' });

 });

 it('Test case 4 : setFormValid handle is called when  the email value changes', () => {
  render(<Email {...testProps} />);
  const emailField=screen.queryByTestId('email');
  fireEvent.change(emailField, { target: { value: 'test@gmail.com' } });
  expect(testProps.setFormValid).toHaveBeenCalledWith({ ...testProps.userProfile.formValid, email :true});

});

it('Test case 5 : Verify  if email is not displayed if privacy settings is falsey ', () => {
  testProps= {
    userProfile: { email: 'volunteer@gmail.com', emailSubscriptions:true},
    setUserProfile: jest.fn(),
    formValid: { email: true },
    setFormValid: jest.fn(),
    canEdit: true,
    desktopDisplay: true,
    handleUserProfile:jest.fn(),
  };  render(<Email {...testProps} />);
  
  expect(screen.queryByText(testProps.userProfile.email)).not.toBeInTheDocument();

  expect(screen.queryByText("Email is not Valid")).toBeInTheDocument();

});

});

/***************************************************************************** */
describe(' Test Suite for formatPhoneNumber', () => {
  it('Test case 1 : Formats a domestic (USA) phone number', () => {
    expect(formatPhoneNumber("1234567890")).toBe("( 123 ) 456 - 7890");
  });

  it('Test case 2 : Formats an international phone number', () => {
    expect(formatPhoneNumber("+11234567890")).toBe("+1( 123 ) 456 - 7890");
  });

  it('Test case 3 : Returns unconventional phone number (less than 10 digits) as is', () => {
    expect(formatPhoneNumber("12345")).toBe("12345");
  });

  it('Test case 4 : Returns unconventional phone number (more than 11 digits) as is', () => {
    expect(formatPhoneNumber("123456789012")).toBe("123456789012");
  });

  it('Test case 5 : Formats phone number with non-numeric characters', () => {
    expect(formatPhoneNumber("123-456-7890")).toBe("( 123 ) 456 - 7890");
  });

  it('Test case 6 : Formats phone number with leading or trailing whitespace', () => {
    expect(formatPhoneNumber("  1234567890  ")).toBe("( 123 ) 456 - 7890");
  });
});

/*************************************************************** */
describe('Test Suite for Phone component', () => {
  let testProps= {
   userProfile: { phoneNumber:"123456789", privacySettings:{email :true}},
   setUserProfile: jest.fn(),
   formValid: { email: true },
   setFormValid: jest.fn(),
   canEdit: true,
   desktopDisplay: true,
   handleUserProfile:jest.fn(),
 };

 it('Test case 1 : Phone component renders with editable fields when canEdit is true ', () => {
  render(<Phone {...testProps} />);
   const phInputStyle=screen.queryByText('ph-input-style');
   expect(phInputStyle).toBeInTheDocument();
   const phoneToggle=screen.queryByText('phone');
   expect(phoneToggle).toBeInTheDocument();
  
 });

 it('Test case 2 : Phone component renders non-editable fields when canEdit is false ', () => {
   testProps.canEdit = false;
   render(<Phone {...testProps} />);
   expect(screen.queryByText('ph-input-style')).not.toBeInTheDocument();
   expect(screen.queryByText('phone')).not.toBeInTheDocument();
 });



it('Test case 3 : Verify  if phone number  is not displayed if privacy settings and phone is falsey ', () => {
  testProps= {
    userProfile: {phoneNumber:'123456789'},
    setUserProfile: jest.fn(),
    formValid: { email: true },
    setFormValid: jest.fn(),
    canEdit: true,
    desktopDisplay: true,
    handleUserProfile:jest.fn(),
  };  render(<Email {...testProps} />);
  
  expect(screen.queryByText((testProps.userProfile.phoneNumber).trim())).not.toBeInTheDocument();

});

});

/******************************************************** */

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('Test suite for TimeZoneDifference component ', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Mock timers
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });


  let testProps = {
    isUserSelf: false,
    errorOccurred: false,
    setErrorOccurred: jest.fn(),
    desktopDisplay: true,
    userProfile: {
      timeZone: 'America/New_York',
    },
  };

 

  it('Test case 1 : Renders "This is your own profile page" when user is self', () => {
    testProps.isUserSelf=true;
    render(<TimeZoneDifference {...testProps} />);
    expect(screen.getByText('This is your own profile page')).toBeInTheDocument();
  });

  it('Test case 2 : Renders timezone offset when user is not self', () => {
    testProps.isUserSelf=false;
    render(<TimeZoneDifference {...testProps} />);
    expect(screen.getByText(/[-+]\d+ hours/)).toBeInTheDocument(); 
  });

  it('Test case 3 : Renders error message if the component has encountered error for the first time ',()=>{
     testProps = {
      isUserSelf: false,
      errorOccurred: false,
      setErrorOccurred: jest.fn(),
      desktopDisplay: true,
      userProfile: {
        timeZone: 'Invalid/Timezone',
      },    };
    render(<TimeZoneDifference {...testProps} />);
    jest.runAllTimers(); 
    expect(toast.error).toHaveBeenCalledWith('Error occurred while trying to calculate offset between timezones');
  });


  it('Test case 4 : Does not render error message if the component has not encountered error for the first time ',()=>{
   testProps.errorOccurred=true;
    render(<TimeZoneDifference {...testProps} />);
    jest.runAllTimers(); 
    expect(toast.error).not.toHaveBeenCalledWith('Error occurred while trying to calculate offset between timezones');
  });

  // it('Test case 5 : verify if the timezone difference calculation works correctly ',()=>{
  //   testProps.userProfile.timeZone='America/New_York';
  //   render(<TimeZoneDifference {...testProps} />);
  //   expect(screen.getByText(/[-+]3+ hours/)).toBeInTheDocument(); 
  //   testProps.userProfile.timeZone='Europe/London';
  //   render(<TimeZoneDifference {...testProps} />);
  //   expect(screen.getByText(/[-+]8+ hours/)).toBeInTheDocument(); 

  });

});
/*********************************************************************** */


describe('BasicInformationTab component', () => {

const addDeleteEditOwners=jest.fn();
let testProps= {
     userProfile: { firstName:'test', lastname: 'user',phoneNumber:"123456789", privacySettings:{email :true}, location:{userProvided:'los angeles'}, 
     collaborationPreference: 'video',  role: 'Admin'},
     setUserProfile: jest.fn(),
     formValid: { email: true },
     setFormValid: jest.fn(),
     canEdit: true,
     desktopDisplay: true,
     handleUserProfile:jest.fn(),
     roles:['Admin','Owner','Volunteer','Manager'],
     canEditRole:true,
   
   };
  

const mockStore = configureStore([thunk]);
const initialState = {
  auth: {
    user: {
      permissions: {
        frontPermissions: [],
        backPermissions: [],
      },
      role: 'Volunteer',
    },
  },
  userProfile: {
    firstName:'test', lastname: 'user',phoneNumber:"123456789", privacySettings:{email :true}, location:{userProvided:'los angeles'}
  },
  role: mockAdminState.role,
};

let store;
 
beforeEach(() => {
  store = mockStore(initialState);
  
});
afterEach(() => {
  store.clearActions();
});



it('Test case 1: verify Basic rendering ', () => {
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
  expect(screen.getByText("Name")).toBeInTheDocument();
});

it('Test case 2: Renders the Name component as expected  ', () => {
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
  expect(screen.getByText("Name")).toBeInTheDocument(); // label
  expect(screen.getByTestId("info-name")).toBeInTheDocument();// tooltip
  expect(screen.getByTestId("firstName")).toBeInTheDocument(); // input field
  expect(screen.getByTestId("lastName")).toBeInTheDocument(); //input field 
});
it('Test case 3: Renders the Title component as expected  ', () => {
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
  expect(screen.getByText("Title")).toBeInTheDocument();// Label
  expect(screen.getByTestId("info-title")).toBeInTheDocument();//tooltip
  expect(screen.getByTestId("jobTitle")).toBeInTheDocument();//input field 
});

it('Test case 4: Renders the Email component as expected  ', () => {
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
  expect(screen.getByText("Email")).toBeInTheDocument();// Label
  expect(screen.getByTestId("info-email")).toBeInTheDocument();// tooltip
  expect(screen.getByTestId("email")).toBeInTheDocument(); // input field
  expect(screen.queryByText('emailPrivacy')).toBeInTheDocument(); // toggle button
  expect(screen.queryByText('emailSubscription')).toBeInTheDocument(); // toggle button

});

it('Test case 5: Renders the Phone component as expected  ', () => {
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
  expect(screen.getByText("Phone")).toBeInTheDocument();// Label
  expect(screen.queryByText('ph-input-style')).toBeInTheDocument();// Toggle
  expect(screen.getByText('phone')).toBeInTheDocument();// PhoneInput 
 
});

it('Test case 6: Renders videoCallPreference component with an editable field when canEdit is true ', () => {
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
      expect(screen.getByTestId("collaborationPreference")).toBeInTheDocument();//input field 
});
it('Test case 7: setUserProfile handle is called when the collaboration preference changes changes ', () => {
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
  const collabPref=screen.queryByTestId('collaborationPreference');
  fireEvent.change(collabPref, { target: { value: 'audio' } });
  expect(testProps.setUserProfile).toHaveBeenCalledWith({ ...testProps.userProfile, collaborationPreference: 'audio' });

});


it('Test case 8: Renders videoCallPreference component with non- editable field when canEdit is false ', () => {
  testProps.canEdit=false;
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
  expect(screen.queryByTestId("collaborationPreference")).not.toBeInTheDocument();
  expect(screen.queryByText("video")).toBeInTheDocument();//non- editable field 

});

it('Test case 9: Renders the role  component with a combo box  when canEditRole is true ', () => {
  testProps.canEditRole=true;
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
  expect(screen.getByText("Role")).toBeInTheDocument(); // Label
  expect(screen.getByRole('combobox')).toBeInTheDocument(); // combo box
});
it('Test case 10 : Does not render a combo box for role component   when canEditRole is false', () => {
  testProps.canEditRole=false;
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
});

it('Test case 11 : Renders all role type as options except Owner ', () => {
  testProps.canEdit=true;
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );

expect(screen.queryByText('Admin')).toBeInTheDocument();
expect(screen.queryByText('Owner')).not.toBeInTheDocument();

});


it('Test case 12 : Does not render the EditableInfoModal when desktopDisplay is false', () => {
  testProps.desktopDisplay=false;
    render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );  
    expect(screen.queryByText('RoleInfo')).not.toBeInTheDocument();
});


it('Test case 13 : Renders the objects of the location component', () => {
  testProps.desktopDisplay=true;
    render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
      />
    </Provider>,
  );  
expect(screen.getByText('Location')).toBeInTheDocument();

  
});

it('Test case 14 : Renders appropriate object in the location component  and calls appropriate handler functions', async () => {
const mockhandleLocation =jest.fn();
const mockOnClickGetTimeZone = jest.fn();
  render(
    <Provider store={store}>
      <BasicInformationTab
       {...testProps}
       addDeleteEditOwners={addDeleteEditOwners}
       handleLocation={mockhandleLocation}
       onClickGetTimeZone={mockOnClickGetTimeZone}
      />
    </Provider>,
  );  
  const inputField = screen.getByTestId('location');
  expect(inputField).toBeInTheDocument();

  fireEvent.change(inputField, { target: { value: 'Los Angeles' } });
  expect(testProps.setUserProfile).toHaveBeenCalledWith({
    ...testProps.userProfile,
    location: {
      ...testProps.userProfile.location,
      city: '',
      coords: { lat: '', lng: '' },
      country: '',
      userProvided: 'Los Angeles'
    }
  });
  const getTimeZoneButton = screen.getByRole('button', { name: /Get Time Zone/i });
  expect(getTimeZoneButton).toBeInTheDocument();
});

});

  
  // expect(screen.getByText("Time Zone")).toBeInTheDocument();
  // expect(screen.getByText("Difference in this Time Zone from Your Local")).toBeInTheDocument();
  // expect(screen.getByText("Status")).toBeInTheDocument();
