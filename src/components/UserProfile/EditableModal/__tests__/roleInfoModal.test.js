import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RoleInfoModal from '../roleInfoModal';

describe('RoleInfoModal component Test cases', () => {
  test('Test case 1 : Renders without crashing', () => {
    const info = {
      CanRead: true,
    };
    const { getByTitle}=render(<RoleInfoModal info={info}/>);
    const infoIcon = getByTitle('Click for user class information');
    expect(infoIcon).toBeInTheDocument();
  });

  it('Test case 2 : Displays modal when CanRead is true', () => {
    const info = {
      CanRead: true,
    };

    const { getByTitle, getByText } = render(<RoleInfoModal info={info} />);
    const infoIcon = getByTitle('Click for user class information');
    fireEvent.click(infoIcon);
    const modalTitle = getByText('Welcome to Information Page!');
    expect(modalTitle).toBeInTheDocument();
  });

  it('Test case 3 : Displays modal with correct infoContent',()=>{
    const info = {
      infoContent: '<p>Testing the info content</p>',
      CanRead: true,
    };
    const { getByTitle, getByText } = render(<RoleInfoModal info={info} />);
    const infoIcon = getByTitle('Click for user class information');
    fireEvent.click(infoIcon);
    const modalContent = getByText('Testing the info content', { exact: false });
    expect(modalContent).toBeInTheDocument();
  });

  it('Test case 4 : Does not display modal when CanRead is false', () => {
    const info = {
      infoContent: '<p>Some info content</p>',
      CanRead: false,
    };

    const { queryByText } = render(<RoleInfoModal info={info} />);

    const modalTitle = queryByText('Welcome to Information Page!');
    expect(modalTitle).not.toBeInTheDocument();
  });
});