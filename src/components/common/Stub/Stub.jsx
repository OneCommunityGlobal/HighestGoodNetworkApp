import { GiHollowCat } from 'react-icons/gi';
import './Stub.css';

export default function Stub() {
  return (
    <div className="stub-wrapper">
      <GiHollowCat size={72} />
      <div className="stub-hint">Nothing&apos;s here at the moment</div>
    </div>
  );
}
