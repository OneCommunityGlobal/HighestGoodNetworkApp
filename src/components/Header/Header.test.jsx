import React from 'react';
import { shallow } from 'enzyme';
import { Header } from './Header';
import mockAdminState from '../../__tests__/mockAdminState';
import { getHeaderData } from '../../actions/authActions';

describe('Header page structure', () => {
  let mountedHeader, props;
  beforeEach(() => {
    props = mockAdminState;
    props.getHeaderData = getHeaderData;
    props.getTimerData = jest.fn();
    mountedHeader = shallow(<Header {...props} />);
  });

  it('should be rendered with a navBar', () => {
    const navBar = mountedHeader.find('Navbar');
    expect(navBar.length).toBe(1);
  });

  it('should be rendered with multiple navLinks', () => {
    const navLinks = mountedHeader.find('NavLink');
    expect(navLinks.length).toBeGreaterThan(2);
  });

  it('should be rendered with multiple dropdown items', () => {
    const dropDownItems = mountedHeader.find('DropdownItem');
    expect(dropDownItems.length).toBeGreaterThan(2);
  });

  it('should be rendered with at least one img', () => {
    const img = mountedHeader.find('img');
    expect(img.length).toBeGreaterThan(0);
  });
});

describe('UnAuthenticated Header page structure', () => {
  let mountedHeader, props;
  beforeEach(() => {
    props = { auth: { isAuthenticated: false } };
    props.isAuthenticated = false;
    props.getHeaderData = getHeaderData;
    props.getTimerData = jest.fn();
    mountedHeader = shallow(<Header {...props} />);
  });

  it('should be rendered with a navBar', () => {
    const navBar = mountedHeader.find('Navbar');
    expect(navBar.length).toBe(1);
  });

  it('should be rendered with no navLinks', () => {
    const navLinks = mountedHeader.find('NavLink');
    expect(navLinks.length).toBe(0);
  });

  it('should be rendered with no dropdown items', () => {
    const dropDownItems = mountedHeader.find('DropdownItem');
    expect(dropDownItems.length).toBe(0);
  });

  it('should be rendered with no img', () => {
    const img = mountedHeader.find('img');
    expect(img.length).toBe(0);
  });
});
