import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserProfileModal from '..';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { rolesMock } from '__tests__/mockStates';

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

const userProfile={
  infringements:[]
}

let store;

beforeEach(() => {
  store = mockStore({
    auth: auth,
    userProfile:userProfile,
    theme:theme,
    role: rolesMock
  })
});

jest.mock('axios');
const modifyBlueSquares=jest.fn()
const closeModal=jest.fn()
const updateLink=jest.fn()


describe('UserProfileModal component', () => {
  it('renders without crashing', () => {
    render(<Provider store={store}><UserProfileModal isOpen={true}
      closeModal={closeModal}
      updateLink={updateLink}
      modifyBlueSquares={modifyBlueSquares}
      modalTitle={"modal title"}
      modalMessage={"modal message"}
      type={'viewBlueSquare'}
      userProfile={userProfile}
      id={"user123"}
      /></Provider>)
  });
  it('check if modal is open when isOpen is set to true',()=>{
    render(<Provider store={store}><UserProfileModal isOpen={true}
      closeModal={closeModal}
      updateLink={updateLink}
      modifyBlueSquares={modifyBlueSquares}
      modalTitle={"modal title"}
      modalMessage={"modal message"}
      type={'viewBlueSquare'}
      userProfile={userProfile}
      id={"user123"}
      /></Provider>)
    
    expect(screen.getByRole('document')).toBeInTheDocument()
  })
  it('check if modal is closed when isOpen is set to false',()=>{
    render(<Provider store={store}><UserProfileModal isOpen={false}
      closeModal={closeModal}
      updateLink={updateLink}
      modifyBlueSquares={modifyBlueSquares}
      modalTitle={"modal title"}
      modalMessage={"modal message"}
      type={'viewBlueSquare'}
      userProfile={userProfile}
      id={"user123"}
      /></Provider>)
    
    expect(screen.queryByRole('document')).not.toBeInTheDocument()
  })
  it('check modal title displays as expected',()=>{
    render(<Provider store={store}><UserProfileModal isOpen={true}
      closeModal={closeModal}
      updateLink={updateLink}
      modifyBlueSquares={modifyBlueSquares}
      modalTitle={"modal title"}
      modalMessage={"modal message"}
      type={'viewBlueSquare'}
      userProfile={userProfile}
      id={"user123"}
      /></Provider>)
    
    expect(screen.getByText('modal title')).toBeInTheDocument()
  })
  it('check if Cancel button works as expected when the type is not save',()=>{
    render(<Provider store={store}><UserProfileModal isOpen={true}
      closeModal={closeModal}
      updateLink={updateLink}
      modifyBlueSquares={modifyBlueSquares}
      modalTitle={"modal title"}
      modalMessage={"modal message"}
      type={'viewBlueSquare'}
      userProfile={userProfile}
      id={"user123"}
      /></Provider>)
    
    const cancelButton=screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    expect(closeModal).toHaveBeenCalled()
  })
  it('check if Close button works as expected when the type is save',()=>{
    render(<Provider store={store}><UserProfileModal isOpen={true}
      closeModal={closeModal}
      updateLink={updateLink}
      modifyBlueSquares={modifyBlueSquares}
      modalTitle={"modal title"}
      modalMessage={"modal message"}
      type={'save'}
      userProfile={userProfile}
      id={"user123"}
      /></Provider>)
    
    const closeButton=screen.getByText('Close')
    fireEvent.click(closeButton)
    expect(closeModal).toHaveBeenCalled()
  })
  it('check if modal message gets displayed as expected when the type is save',()=>{
    render(<Provider store={store}><UserProfileModal isOpen={true}
      closeModal={closeModal}
      updateLink={updateLink}
      modifyBlueSquares={modifyBlueSquares}
      modalTitle={"modal title"}
      modalMessage={"modal message"}
      type={'save'}
      userProfile={userProfile}
      id={"user123"}
      /></Provider>)
    expect(screen.getByText('modal message')).toBeInTheDocument()
  })
  it('check if Resize button works as expected when type is image',()=>{
    render(<Provider store={store}><UserProfileModal isOpen={true}
      closeModal={closeModal}
      updateLink={updateLink}
      modifyBlueSquares={modifyBlueSquares}
      modalTitle={"modal title"}
      modalMessage={"modal message"}
      type={'image'}
      userProfile={userProfile}
      id={"user123"}
      /></Provider>)

      const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
      const resizeButton=screen.getByText('Resize')
      fireEvent.click(resizeButton)
      expect(windowOpenSpy).toHaveBeenCalledWith('https://picresize.com/');
      windowOpenSpy.mockRestore();
  })
  it('check if Resize button does not get displayed when type is not image',()=>{
    render(<Provider store={store}><UserProfileModal isOpen={true}
      closeModal={closeModal}
      updateLink={updateLink}
      modifyBlueSquares={modifyBlueSquares}
      modalTitle={"modal title"}
      modalMessage={"modal message"}
      type={'save'}
      userProfile={userProfile}
      id={"user123"}
      /></Provider>)
      expect(screen.queryByText('Resize')).not.toBeInTheDocument()
  })

});
