import {shallow} from 'enzyme'
import React from 'react'
import Header from '../components/Header'


describe("Header tests", () => {
    let headerMountedPage;
    beforeEach(()=> {
        headerMountedPage = shallow(<Header />)
    })
})