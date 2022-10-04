import React from 'react';
import { shallow } from 'enzyme';
import { ForcePasswordUpdate } from './ForcePasswordUpdate';
import { clearErrors } from '../../actions/errorsActions';
import { render } from '@testing-library/react';

describe('Force Password Update page structure', () => {
  let mountedFPUpdate, props;
  beforeEach(() => {
    props = {
      auth: { isAuthenticated: true },
      errors: {},
      clearErrors: clearErrors,
      forcePasswordUpdate: ForcePasswordUpdate,
    };
    mountedFPUpdate = shallow(<ForcePasswordUpdate {...props} />);
  });

  it('should be rendered with two input fields', () => {
    const inputs = mountedFPUpdate.find('Input');
    expect(inputs.length).toBe(2);
  });

  it('should be rendered with one button', () => {
    const button = mountedFPUpdate.find('button');
    expect(button.length).toBe(1);
  });

  it('should be rendered with one h2 labeled Change Password', () => {
    const h2 = mountedFPUpdate.find('h2');
    expect(h2.length).toEqual(1);
    expect(h2.first().text()).toContain('Change Password');
  });
});

describe('When user tries to input data', () => {
  let mountedFPUpdate, props, fPU;

  beforeEach(() => {
    fPU = jest.fn();
    props = {
      match: { params: { userId: '5edf141c78f1380017b829a6' } },
      auth: { isAuthenticated: true },
      errors: {},
      clearErrors: clearErrors,
      forcePasswordUpdate: fPU,
    };
    mountedFPUpdate = shallow(<ForcePasswordUpdate {...props} />);
  });

  it('should call handleInput when input is changed', () => {
    const spy = jest.spyOn(mountedFPUpdate.instance(), 'handleInput');
    mountedFPUpdate
      .find("[name='newpassword']")
      .simulate('change', { currentTarget: { name: 'newpassword', value: 'abc' } });
    expect(spy).toHaveBeenCalled();
  });

  it('should correctly update the new password value in the state', () => {
    const expected = 'newpassword';
    const Input = { name: 'newpassword', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedFPUpdate.instance().handleInput(mockEvent);

    expect(mountedFPUpdate.instance().state.data.newpassword).toEqual(expected);
  });

  it('should correctly update the confirm password value in the state', () => {
    const expected = 'newpassword';
    const Input = { name: 'confirmnewpassword', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedFPUpdate.instance().handleInput(mockEvent);

    expect(mountedFPUpdate.instance().state.data.confirmnewpassword).toEqual(expected);
  });

  it('should have disabled submit button if form is invalid', () => {
    const button = mountedFPUpdate.find('button');
    expect(button.props()).toHaveProperty('disabled');
  });

  it('onSubmit forcePasswordUpdate method is called with credentials', async () => {
    await mountedFPUpdate.instance().doSubmit();
    expect(fPU).toHaveBeenCalledWith({ userId: '5edf141c78f1380017b829a6', newpassword: '' });
  });
});
