import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux'; 
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
import RoleInfoModal from '../RoleInfoModal';

const mockStore = configureStore([]);

describe('RoleInfoModal component Test cases', () => {
  test('Test case 1 : Renders without crashing', () => {
    const store = mockStore({
      theme: themeMock,
    });

    const info = {
      CanRead: true,
    };
    const { getByTitle}=render(<Provider store={store}><RoleInfoModal info={info}/></Provider>);
    const infoIcon = getByTitle('Click for user class information');
    expect(infoIcon).toBeInTheDocument();
  });

  it('Test case 2 : Displays modal when CanRead is true', () => {
    const store = mockStore({
      theme: themeMock,
    });

    const info = {
      CanRead: true,
    };

    const { getByTitle, getByText } = render(<Provider store={store}><RoleInfoModal info={info}/></Provider>);
    const infoIcon = getByTitle('Click for user class information');
    fireEvent.click(infoIcon);
    const modalTitle = getByText('Welcome to Information Page!');
    expect(modalTitle).toBeInTheDocument();
  });

  it('Test case 3 : Displays modal with correct infoContent',()=>{
    const store = mockStore({
      theme: themeMock,
    });
    const info = {
      infoContent: '<p>Testing the info content</p>',
      CanRead: true,
    };
    const { getByTitle, getByText } = render(<Provider store={store}><RoleInfoModal info={info}/></Provider>);
    const infoIcon = getByTitle('Click for user class information');
    fireEvent.click(infoIcon);
    const modalContent = getByText('Testing the info content', { exact: false });
    expect(modalContent).toBeInTheDocument();
  });

  it('Test case 4 : Does not display modal when CanRead is false', () => {
    const store = mockStore({
      theme: themeMock,
    });
    const info = {
      infoContent: '<p>Some info content</p>',
      CanRead: false,
    };

    const { queryByText } = render(<Provider store={store}><RoleInfoModal info={info}/></Provider>);

    const modalTitle = queryByText('Welcome to Information Page!');
    expect(modalTitle).not.toBeInTheDocument();
  });
});