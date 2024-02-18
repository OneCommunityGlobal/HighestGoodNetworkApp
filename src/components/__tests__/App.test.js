import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import App from '../App';
import Dashboard from '../Dashboard';

describe('App tests', () => {
  let mountedapp;

  beforeEach(() => {
    mountedapp = shallow(<App />);
  });

  it('renders without crashing', () => {
    shallow(<App />);
  });
});
