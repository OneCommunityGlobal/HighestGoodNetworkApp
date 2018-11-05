import React from 'react';
import ReactDOM from 'react-dom';
import App from '../components/App.js';
import {shallow} from 'enzyme'
import Dashboard from '../components/Dashboard'

describe("App tests", () => {

  let mountedapp;

  
  beforeEach(() => {
    mountedapp = shallow(<App/>);
  })

  it ("renders without crashing", () => {
    shallow(<App />)

  })
 
  it('renders a header component', () => {

    expect(mountedapp.find('Header').length).toBe(1)
    
  });
  

})