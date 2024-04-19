import { GiHollowCat } from 'react-icons/gi';
import './Stub.css';

// eslint-disable-next-line import/prefer-default-export, react/function-component-definition
export const Stub = ({color}) => (
  <div className="stub-wrapper">
    <GiHollowCat size={72} />
    <div className="stub-hint" style={{color: color}}>Nothing&apos;s here at the moment</div>
  </div>
);
