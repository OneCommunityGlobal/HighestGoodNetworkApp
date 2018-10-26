import React from 'react';
import ReactDOM from 'react-dom';
import LoginPage from '../Login/LoginPage';


describe("Tests for LoginPage", () => {

    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<LoginPage />, div);
        ReactDOM.unmountComponentAtNode(div);
      });

    it("has 2 input fields", () => 
    {
        
    })
      
})


