import { enableNewTimer } from 'features/enableNewTimer';
import Logout from './Logout';
import LogoutTimer from './LogoutNewTimer';

export default enableNewTimer ? LogoutTimer : Logout;
