import { GiHollowCat } from 'react-icons/gi';
import './Stub.css';

// eslint-disable-next-line import/prefer-default-export, react/function-component-definition
export const Stub = ({darkMode}) => (
  <div className="stub-wrapper">
    <GiHollowCat size={72} />
    <div className={`stub-hint ${darkMode ? 'text-light' : ''}`}>Nothing&apos;s here at the moment</div>
  </div>
);
