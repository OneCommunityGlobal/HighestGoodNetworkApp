/** Used in jest.config.js */
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

configure({ adapter: new Adapter() });

const fake = { firstName: 'Jane', lastName: 'Smith' };
global.viewingUser = fake;
window.viewingUser = fake;