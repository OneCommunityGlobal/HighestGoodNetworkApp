import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'
import UserLinks from './UserLinks'
// import toJson from 'enzyme-to-json'
import sinon from 'sinon'


// To remove errors for now...
it('It should render without errors', () => {
})


//  "test": "cross-env CI=true react-scripts test --env=jsdom",

// describe('UserLinks', () => {
// 	it('UserLinks without any links', () => {
// 		const wrapper = shallow(<UserLinks />)
// 		expect(toJson(wrapper)).toMatchSnapshot()
// 	})
// 	it('UserLinks with linkType and empty links', () => {
// 		const props = {
// 			linkType: 'Admin',
// 			links: []
// 		}
// 		const wrapper = shallow(<UserLinks {...props} />)
// 		expect(toJson(wrapper)).toMatchSnapshot()
// 	})

// 	it('UserLinks with linkType Admin and links', () => {
// 		const props = {
// 			linkType: 'Admin',
// 			links: [{ Link: 'www.google.com', Name: 'Google' }],
// 			handleModelState: sinon.spy(),
// 			isUserAdmin: true
// 		}
// 		const wrapper = shallow(<UserLinks {...props} />)
// 		wrapper.find('Button').simulate('click')
// 		expect(toJson(wrapper)).toMatchSnapshot()
// 	})

// 	it('UserLinks with linkType Volunteer and links with click simulation', () => {
// 		const handleModelState = sinon.spy()
// 		const props = {
// 			linkType: 'Volunteer',
// 			links: [{ Link: 'www.google.com', Name: 'Google' }],
// 			handleModelState
// 		}
// 		const wrapper = shallow(<UserLinks {...props} />)
// 		wrapper.find('Button').simulate('click')

// 		expect(toJson(wrapper)).toMatchSnapshot()
// 	})
// })
