import React from 'react';
import ReactDOM from 'react-dom';
import App from '../components/App';
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

<<<<<<< HEAD
  it('renders a header component', () => {
    mountedapp = shallow(<App/>)
    expect(mountedapp.find('Header').length).toBe(1)
    
  });
=======
>>>>>>> master
  

})
