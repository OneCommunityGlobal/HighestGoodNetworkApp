import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import mockAdminState from '__tests__/mockAdminState';
import WBSItem from './WBSItem';


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
        };
    })

    it('should render WBSItem correctly', () => {
      
      const { getByText, container } = renderComponent(
        <Provider store={store}>
          <WBSItem {...props} />
        </Provider>
      );
    
      console.log(container.innerHTML)
      expect(getByText('WBS 1')).toBeInTheDocument();
    });
  
    it('should open modal when delete button is clicked', async () => {
     
        const { container, findByText } = renderComponent(
            <Provider store={store}>
              <WBSItem {...props} />
            </Provider>
          );
        
          const button = container.querySelector('.btn.btn-outline-danger.btn-sm');
          fireEvent.click(button);
        
        
          const modalText = await findByText('Are you sure you want to delete?');
          expect(modalText).toBeInTheDocument();
    });
  
  });
  
