import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import mockAdminState from '__tests__/mockAdminState';
import WBSItem from './WBSItem';

jest.mock('react-router-dom', () => ({
  Link: ({ 
    children, 
    to, 
    ...rest 
  }) => 
  <a href={to} {...rest}>{children}</a>,
}));


const mockStore = configureStore([thunk]);

let store;
beforeEach(() => {
  store = mockStore({
    auth: {
      user: {
        permissions: {
          frontPermissions: ['deleteWbs'],
          backPermissions: [],
        },
        role: 'Manager',
      },
    },
    role: mockAdminState.role,
  });
});

afterEach(() => {
  store.clearActions();
});

const renderComponent = (index, key, wbsId, projectId, name) => {
    return render(
      <Provider store={store}>
            <table>
            <tbody>
            <WBSItem
              index={index}
              key={key}
              wbsId={wbsId}
              projectId={projectId}
              name={name}
              popupEditor={{ currPopup: { popupContent: 'Are you sure you want to delete?' } }}
            />
         </tbody>
         </table>
      </Provider>
    );
  };
  

describe('WBSItem Component', () => {
    
    let props;

    beforeEach(() => {
        props = {
            index: 1,
            wbsId: 'wbsId1',
            projectId: 'projectId1',
            name: 'WBS 1',
            popupEditor: {
                currPopup: { popupContent: 'Are you sure you want to delete?' },
            },
            getPopupById: jest.fn(),  // Mock function
            deleteWbs: jest.fn(),  // Mock function
            hasPermission: jest.fn().mockReturnValue(true),  // Example mock
        };
    })

    it('should render WBSItem correctly', () => {
      
      const { getByText } = renderComponent(
        <Provider store={store}>
          <table>
          <tbody>
          <WBSItem {...props} />
          </tbody>
      </table>
        </Provider>
      );
    
      
      expect(getByText('WBS 1')).toBeInTheDocument();
    });
  
    it('should open modal when delete button is clicked', async () => {
     
        const { container, findByText } = renderComponent(
            <Provider store={store}>
                <table>
                <tbody>
                <WBSItem {...props} />
                </tbody>
      </table>
            </Provider>
          );
        
          const button = container.querySelector('.btn.btn-outline-danger.btn-sm');
          fireEvent.click(button);
        
        
          const modalText = await findByText('Are you sure you want to delete?');
          expect(modalText).toBeInTheDocument();
    });
  
  });
  
