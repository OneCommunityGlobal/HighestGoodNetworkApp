import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'
import UserLinks from './UserLinks'
import toJson from 'enzyme-to-json'
//  "test": "cross-env CI=true react-scripts test --env=jsdom",
describe('UserLinks', () => {
	it('UserLinks without any links', () => {
		const wrapper = shallow(<UserLinks />)
		expect(toJson(wrapper)).toMatchSnapshot()
	})
	it('UserLinks with linkType and emty links', () => {
		const props = {
			linkType: 'Admin',
			links: []
		}
		const wrapper = shallow(<UserLinks {...props} />)
		console.log(wrapper)
		expect(toJson(wrapper)).toMatchSnapshot()
	})

	it('UserLinks with linkType Admin and links', () => {
		const props = {
			linkType: 'Admin',
			links: [{ Link: 'www.google.com', Name: 'Google' }]
		}
		const wrapper = shallow(<UserLinks {...props} />)
		console.log(wrapper)
		expect(toJson(wrapper)).toMatchSnapshot()
	})

	it('UserLinks with linkType Volunteer and links', () => {
		const props = {
			linkType: 'Volunteer',
			links: [{ Link: 'www.google.com', Name: 'Google' }]
		}
		const wrapper = shallow(<UserLinks {...props} />)
		console.log(wrapper)
		expect(toJson(wrapper)).toMatchSnapshot()
	})
})
