import React from 'react';
import { shallow, mount } from 'enzyme';
import Profile from '../components/Profile';
import {MemoryRouter} from 'react-router-dom'


describe("Profile Page",()=> {
    let profilePage;

    beforeEach( ()=> {
        let userProfile = {firstName :"ABC" }
        profilePage = shallow(<Profile userProfile = {userProfile}/>)

    })

describe("Structure", ()=> {

    it("should have a firstName field", ()=> {
        let firstName = profilePage.find('[name="firstName"]');
        expect(firstName.length).toBe(1)

    })

    it("should have a lastName field", ()=> {
        let firstName = profilePage.find('[name="lastName"]');
        expect(firstName.length).toBe(1)

    })
    it("should have a email field", ()=> {
        let firstName = profilePage.find('[name="email"]');
        expect(firstName.length).toBe(1)

    })
    it("should have a weeklycommited hours field", ()=> {
        let firstName = profilePage.find('[name="weeklyComittedHours"]');
        expect(firstName.length).toBe(1)

    })
})
    

})