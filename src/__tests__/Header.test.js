import {shallow} from 'enzyme'
import React from 'react'
import Header from '../components/Header'


describe.skip("Header tests", () => {

    let headerMountedPage;
    beforeEach(()=> {
        headerMountedPage = shallow(<Header />)
    })

    it("should render a profile pciture", ()=> {
        console.log("something");
    })

})
