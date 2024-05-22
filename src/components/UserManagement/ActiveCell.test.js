import React from 'react';
import { screen, render} from '@testing-library/react';
import { unmountComponentAtNode } from "react-dom";
import userEvent from '@testing-library/user-event';
import ActiveCell from './ActiveCell';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('active cell status check', () => {
  const isActive = true;
  const index = 6;
  const onClick = jest.fn();
  const canChange = true;
  it('displays the activeUser correctly', () => {
    const rendered = render(
      <ActiveCell 
        isActive={isActive} 
        index={index} 
        onClick={onClick} 
        canChange={canChange}
      />, 
      container
    );
    const span = rendered.container.querySelector("span");
    expect(span.className).toBe("activeUser");
  });
  it('displays the not activeUser correctly', () => {
    
    const isActive = false;
    const rendered = render(
      <ActiveCell 
        isActive={isActive} 
        index={index} 
        onClick={onClick} 
        canChange={canChange}
      />, 
      container
    );
    const span = rendered.container.querySelector("span");
    expect(span.className).toBe("notActiveUser");
  });
});


describe('activate cell hover Test', () => {
  const isActive = true;
  const index = 6;
  const onClick = jest.fn();
  const canChange = true;
  it('displays the hover info correctly when active and can change', () => {
    const rendered = render(
      <ActiveCell 
        isActive={isActive} 
        index={index} 
        onClick={onClick} 
        canChange={canChange}
      />, 
      container
    );
    const span = rendered.container.querySelector("span");
    userEvent.hover(span);          
    expect(span.title).toBe("Click here to change the user status");
  });
  it('displays the not activeUser correctly when active and cant change', () => {
    
    const isActive = true;
    const canChange = false;
    const rendered = render(
      <ActiveCell 
        isActive={isActive} 
        index={index} 
        onClick={onClick} 
        canChange={canChange}
      />, 
      container
    );
    const span = rendered.container.querySelector("span");
    userEvent.hover(span);          
    expect(span.title).toBe("Active");
  });
  it('displays the not activeUser correctly when inactive and cant change', () => {
    
    const isActive = false;
    const canChange = false;
    const rendered = render(
      <ActiveCell 
        isActive={isActive} 
        index={index} 
        onClick={onClick} 
        canChange={canChange}
      />, 
      container
    );
    const span = rendered.container.querySelector("span");
    userEvent.hover(span);          
    expect(span.title).toBe("Inactive");
  });
});