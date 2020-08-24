import React from 'react';
import { shallow } from 'enzyme';
import UserProfile from './UserProfile';
import { render, screen } from '@testing-library/react';
import { findByTestAtrr } from '../../../Utils'
import { before, iteratee } from 'lodash';
import { expectation } from 'sinon';

const setUp = (props={}) => {
  const component = shallow(<UserProfile {...props} />);
  return component
}

describe(' User Profile Component', () => {

  // let component;
  // beforeEach(() => {
  //   component = setUp();
  // });

  // it('Should render without errors', () => {
  //   const wrapper = findByTestAtrr(component, 'loading');
  //   expect(wrapper.length).toBe(1);
  // });

  describe('On page load', () => {
    
    let wrapper;
    beforeEach(() => {
      const props = {
        userid: '1',
        isLoading: true,
      };
      wrapper = setUp(props)
    })

    it('Displays loading without errors', () => {
      const component = findByTestAtrr(wrapper, 'loading');
      expect(component.length).toBe(1);
    })

  });


  // describe('On page load', () => {
  //   it('displays loading indicator', () => {
  //     const props = {
  //       currentUser: { userid: '1' },
  //       getWeeklySummaries: jest.fn(),
  //       updateWeeklySummaries: jest.fn(),
  //       loading: true,
  //       summaries: weeklySummaryMockData1,
  //     };

  //     render(<WeeklySummary {...props} />);

  //     expect(screen.getByTestId('loading')).toBeInTheDocument();
  //   });
  //   it('displays an error message if there is an error on data fetch', async () => {
  //     const props = {
  //       currentUser: { userid: '1' },
  //       getWeeklySummaries: jest.fn(),
  //       updateWeeklySummaries: jest.fn(),
  //       fetchError: { message: 'SOME ERROR CONNECTING!!!' },
  //       loading: false,
  //       summaries: weeklySummaryMockData1,
  //     };
  //     render(<WeeklySummary {...props} />);

  //     await waitFor(() => screen.getByTestId('loading'));

  //     expect(screen.getByTestId('error')).toBeInTheDocument();
  //   });
  // });

   

});