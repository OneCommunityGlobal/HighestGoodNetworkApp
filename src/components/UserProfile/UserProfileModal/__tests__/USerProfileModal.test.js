import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserProfileModal from '..';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { rolesMock } from '__tests__/mockStates';

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

const userProfile={
  infringements:[{_id:"user123", date:'2024-04-04T12:00:00.000+00:00',createdDate:'2024-04-04T12:00:00.000+00:00',description:"This is a test blue square"}],
  personalLinks:[],
  adminLinks:[]
}

let store;

beforeEach(() => {
  store = mockStore({
    auth: auth,
    userProfile:userProfile,
    theme:theme,
    role: {roles: rolesMock.role.roles}
  })
});

jest.mock('axios');
const modifyBlueSquares=jest.fn()
const closeModal=jest.fn()
const updateLink=jest.fn()

const renderComponent = (testStore,type,isOpen) =>{
  return render(<Provider store={testStore}><UserProfileModal 
    isOpen={isOpen}
    closeModal={closeModal}
    updateLink={updateLink}
    modifyBlueSquares={modifyBlueSquares}
    modalTitle={"modal title"}
    modalMessage={"modal message"}
    type={type}
    userProfile={userProfile}
    id={"user123"}
    /></Provider>)
}


describe('UserProfileModal component', () => {
  it('renders without crashing', () => {
    renderComponent(store,'viewBlueSquare',true)
  });
  it('check if modal is open when isOpen is set to true',()=>{
    renderComponent(store,'viewBlueSquare',true)
    expect(screen.getByRole('document')).toBeInTheDocument()
  })
  it('check if modal is closed when isOpen is set to false',()=>{
    renderComponent(store,'viewBlueSquare',false)
    expect(screen.queryByRole('document')).not.toBeInTheDocument()
  })
  it('check modal title displays as expected',()=>{
    renderComponent(store,'viewBlueSquare',true)
    expect(screen.getByText('modal title')).toBeInTheDocument()
  })
  it('check if Cancel button works as expected when the type is not save',()=>{
    renderComponent(store,'viewBlueSquare',true)
    const cancelButton=screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(closeModal).toHaveBeenCalled()
  })
  it('check if Close button works as expected when the type is save',()=>{
    renderComponent(store,'save',true)
    const closeButton=screen.getByText('Close')
    fireEvent.click(closeButton)
    expect(closeModal).toHaveBeenCalled()
  })
  it('check if modal message gets displayed as expected when the type is save',()=>{
    renderComponent(store,'save',true)
    expect(screen.getByText('modal message')).toBeInTheDocument()
  })
  it('check if Resize button works as expected when type is image',()=>{
    renderComponent(store,'image',true)
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
    const resizeButton=screen.getByText('Resize')
    fireEvent.click(resizeButton)
    expect(windowOpenSpy).toHaveBeenCalledWith('https://picresize.com/');
    windowOpenSpy.mockRestore();
  })
  it('check if Resize button does not get displayed when type is not image',()=>{
    renderComponent(store,'save',true)
    expect(screen.queryByText('Resize')).not.toBeInTheDocument()
  })
  it('check type updateLink when putUserProfile permission is present',async ()=>{

    const testAuth={user: {
      permissions: {
        frontPermissions: ['putUserProfile'],
        backPermissions: [],
      },
      role: 'Manager',
      userid:'user123'
    }}

    const testStore=mockStore({
      auth: testAuth,
      userProfile:userProfile,
      theme:theme,
      role: {roles: rolesMock.role.roles}
    })

    renderComponent(testStore,'updateLink',true)
    
    expect(screen.getByText('Admin Links:')).toBeInTheDocument()
    expect(screen.getAllByText('Name')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Link URL')[0]).toBeInTheDocument()
    expect(screen.getAllByText('+ ADD LINK:')[0]).toBeInTheDocument()

    const linkName=document.body.querySelector('[id="linkName"]')
    

    fireEvent.change(linkName,{target:{value:"link 1"}})
    expect(linkName.value).toBe("link 1")

    const linkURL=document.body.querySelector('[id="linkURL"')
    fireEvent.change(linkURL,{target:{value:"http://link1.com"}})
    expect(linkURL.value).toBe("http://link1.com")

    const updateButton=screen.getByText("Update")
    fireEvent.click(updateButton)
    expect(updateLink).toHaveBeenCalled()

    expect(screen.getByText("Personal Links:")).toBeInTheDocument()
    

  })
  it('check type updateLink when putUserProfile permission is not present',()=>{
    renderComponent(store,'addBlueSquare',true)
    expect(screen.queryByText('Admin Links:')).not.toBeInTheDocument()

  })
  it('check if add blue square works as expected when type is set to addBlueSquare',()=>{
    
    renderComponent(store,'addBlueSquare',true)

    const dateElement=document.body.querySelector('[id="date"]')
    fireEvent.change(dateElement,{target:{value:"2024-03-15"}})

    expect(screen.getByText("Date")).toBeInTheDocument()
    expect(screen.getByText("Summary")).toBeInTheDocument()

    const summaryElement=document.body.querySelector('[id="summary"]')
    fireEvent.change(summaryElement,{target:{value:"This is a test summary"}})
    expect(summaryElement.value).toBe("This is a test summary")

    const addBlueSquareButton=screen.getByText('Submit')
    fireEvent.click(addBlueSquareButton)
    expect(modifyBlueSquares).toHaveBeenCalled()

  })
  it('check if modify blue square works a s expected when type is set to modBlueSquare',()=>{
    renderComponent(store,'modBlueSquare',true)
    const summaryElement=document.body.querySelector('[id="summary"]')
    fireEvent.change(summaryElement,{target:{value:"This is a second test blue square summary"}})
    expect(summaryElement.value).toBe("This is a second test blue square summary")

    const updateButton=screen.getByText('Update')
    fireEvent.click(updateButton)
    expect(screen.getByText('This is a second test blue square summary')).toBeInTheDocument()
    expect(modifyBlueSquares).toHaveBeenCalled()

    const cancelButton=screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(modifyBlueSquares).toHaveBeenCalled()
    
  })

  it('check if view blue square works as expected whe type is set to viewBlueSquare',()=>{
    renderComponent(store,'viewBlueSquare',true)
    expect(screen.getByText(`Date:${userProfile.infringements[0].date}`)).toBeInTheDocument()
    expect(screen.getByText(`Created Date: ${userProfile.infringements[0].createdDate}`)).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText(`${userProfile.infringements[0].description}`)).toBeInTheDocument()
  })
  it("check if close button gets displayed when type is set to save",()=>{
    renderComponent(store,'save',true)
    const closeButton=screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(screen.getByText('modal message')).toBeInTheDocument()
    expect(closeModal).toHaveBeenCalled();
  })
  it("check if cancel button gets displayed when type is not set to save",()=>{
    renderComponent(store,"image",true)
    const cancelButton=screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(screen.getByText('modal message')).toBeInTheDocument()
    expect(closeModal).toHaveBeenCalled()
  })
  it("check if add blue square do not get displayed type is not set to addBlueSquare",()=>{
    renderComponent(store,"image",true)
    expect(document.body.querySelector("[id='addBlueSquare']")).not.toBeInTheDocument()
  })
  it("check if modify blue square do not get displayed type is not set to modBlueSquare",()=>{
    renderComponent(store,"image",true)
    expect(screen.queryByText('Update')).not.toBeInTheDocument()
  })
  it("check if view blue square do not get displayed type is not set to viewBlueSquare",()=>{
    renderComponent(store,"image",true)
    expect(screen.queryByText(`Date:${userProfile.infringements[0].date}`)).not.toBeInTheDocument()
    expect(screen.queryByText(`Created Date:${userProfile.infringements[0].createdDate}`)).not.toBeInTheDocument()
    expect(screen.queryByText('Summary')).not.toBeInTheDocument()
    expect(screen.queryByText(`${userProfile.infringements[0].description}`)).not.toBeInTheDocument()
  })

});
