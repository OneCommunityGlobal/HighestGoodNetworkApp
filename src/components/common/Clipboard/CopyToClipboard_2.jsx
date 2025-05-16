import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './style.css';

// eslint-disable-next-line react/function-component-definition
const CopyToClipboard = ({ writeText, message }) => {
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(writeText);
    toast.success(message);
  };

  return (
    <FontAwesomeIcon className="copy-to-clipboard" icon={faCopy} onClick={handleCopyToClipboard} />
  );
};

export default CopyToClipboard;
