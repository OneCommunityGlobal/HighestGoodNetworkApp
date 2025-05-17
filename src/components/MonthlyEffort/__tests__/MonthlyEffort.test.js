// eslint-disable-next-line no-unused-vars
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { shallow, mount } from 'enzyme';
import { MonthlyEffort } from '../MonthlyEffort';

describe('Monthly Effort component structure', () => {
  let mountedMonthlyEffort;
  let props;
  beforeEach(() => {
    props = {
      auth: { isAuthenticated: true, user: { userid: 'abcdef' } },
    };
    mountedMonthlyEffort = shallow(<MonthlyEffort auth={props.auth} />);
  });

  it('should be rendered with one h5 labeled Please Sign In', () => {
    const h5 = mountedMonthlyEffort.find('h5');
    expect(h5.length).toEqual(1);
    expect(h5.first().text()).toContain('Monthly Efforts');
  });
});
