import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './style.css';
import { useSelector } from 'react-redux';

const CopyToClipboard = ({ writeText, message }) => {
  const darkMode = useSelector(state => state.theme.darkMode)
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(writeText);
    toast.success(message);
  };

  return (
    <FontAwesomeIcon 
      className="copy-to-clipboard" 
      icon={faCopy} onClick={handleCopyToClipboard} 
      color={darkMode ? 'grey' : ''}
    />
  );
};

export default CopyToClipboard;
