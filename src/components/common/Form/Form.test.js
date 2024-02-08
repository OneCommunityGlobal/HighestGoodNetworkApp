import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import Form from './Form';




describe('Form Component', () => {
    let form;
  
    beforeEach(() => {
      form = new Form(); 
    });
  
    // 1. Initial Rendering and Component Structure
    test('renders without crashing', () => {
      expect(form.state).toEqual({ data: {}, errors: {} });
    });
  
    test('sub-components are rendered correctly', () => {
      expect(form.handleInput).toBeDefined();
      expect(form.handleRichTextEditor).toBeDefined();
      expect(form.handleCollection).toBeDefined();
      expect(form.handleFileUpload).toBeDefined();

      // You can also test if state properties related to sub-components are initialized
      expect(form.state.data).toBeDefined();
      expect(form.state.errors).toBeDefined();
    });
});
describe('Form', () => {
  let form;

  beforeEach(() => {
    form = render(<Form />);
  });

  it('renders without crashing', () => {
    expect(form).toBeTruthy();
  });

  it('calls handleInput when input value changes', () => {
    const input = screen.getByLabelText('Name');
    userEvent.type(input, 'John');
    expect(input.value).toBe('John');
  });

  it('calls handleSubmit when form submitted', () => {
    const handleSubmit = jest.fn();
    form.rerender(<Form onSubmit={handleSubmit} />);

    const submitBtn = screen.getByText('Submit');
    userEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls validateForm on submit', () => {
    const validateForm = jest.fn();
    form.rerender(<Form validateForm={validateForm} />);

    const submitBtn = screen.getByText('Submit');
    userEvent.click(submitBtn);

    expect(validateForm).toHaveBeenCalledTimes(1);
  });

  it('displays validation error for required field', () => {
    const { getByLabelText } = form;

    const submitBtn = screen.getByText('Submit');
    userEvent.click(submitBtn);

    const error = getByLabelText('Name-error');
    expect(error).toHaveTextContent('Name is required');
  });
});
