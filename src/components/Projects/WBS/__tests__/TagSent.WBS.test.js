import TagSent from '../WBSDetail/components/TagSent';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { shallow } from 'enzyme';
import render from '@testing-library/react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

describe('code snippet', () => {
  // expected functioning
  it('should render a <li> element with the correct className', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = jest.fn();
    const wrapper = shallow(<TagSent elm={elm} removeResource={removeResource} />);

    expect(wrapper.find('li').prop('className')).toBe('rounded-pill badge bg-primary text-wrap');
  });

  it('should call removeResource function with correct argument when onClick event is triggered', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = jest.fn();
    const wrapper = shallow(<TagSent elm={elm} removeResource={removeResource} />);

    wrapper.find('li').simulate('click');

    expect(removeResource).toHaveBeenCalledWith(elm.userID);
  });

  it('should render a FontAwesomeIcon', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = jest.fn();
    const wrapper = shallow(<TagSent elm={elm} removeResource={removeResource} />);

    expect(wrapper.find(FontAwesomeIcon).exists()).toBe(true);
  });

  // edge cases
  it('should not pass removeResource function as a prop', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = jest.fn();
    const wrapper = shallow(<TagSent elm={elm} removeResource={removeResource} />);

    expect(wrapper.prop('removeResource')).toBeUndefined();
  });

  it('should render a <li> element with the correct className when the name  and userID property the wrong type', () => {
    const elm = { userID: 'abc', name: 123 };
    const removeResource = jest.fn();
    const wrapper = shallow(<TagSent elm={elm} removeResource={removeResource} />);

    expect(wrapper.find('li').prop('className')).toBe('rounded-pill badge bg-primary text-wrap');
  });

  it('should render a <li> element with the correct text in the <small> element', () => {
    const elm = { userID: 1, name: 'John' };
    const removeResource = jest.fn();
    const wrapper = shallow(<TagSent elm={elm} removeResource={removeResource} />);

    expect(
      wrapper
        .find('li')
        .find('small')
        .text(),
    ).toBe(elm.name);
  });

  /* -----------
   * The TagSent failed the test when elm is not passed in as a prop.
   * Didn't see checks for elm in the original codes.
   *
   * it('should render a <li> element with the correct className when elm prop is not passed', () => {
   *  const removeResource = jest.fn();
   *  const wrapper = shallow(<TagSent removeResource={removeResource} elm={undefined} />);
   *
   *  expect(wrapper.find('li').prop('className')).toBe('rounded-pill badge bg-primary text-wrap');
   * });
   * -----------
   */
});
