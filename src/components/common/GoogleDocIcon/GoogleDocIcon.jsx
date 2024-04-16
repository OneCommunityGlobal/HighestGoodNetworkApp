import googleDocIconPng from '../../../assets/images/google_doc_icon.png'
import { toast } from 'react-toastify';
import './style.css';

export default function GoogleDocIcon({link}) {

  const handleGoogleDocClick = () => {
    const toastGoogleLinkDoesNotExist = 'toast-on-click';
    if (link) {
      window.open(link);
    } else {
      toast.error(
        'Uh oh, no Google Doc is present for this user! Please contact an Admin to find out why.',
        {
          toastId: toastGoogleLinkDoesNotExist,
          pauseOnFocusLoss: false,
          autoClose: 3000,
        },
      );
    }
  };

  return (
    <span onClick={handleGoogleDocClick} >
      {/* inactive: image will be grey if no Google Doc link present */}
      <img className={`google-doc-icon ${link ? "" : "inactive"}`} src={googleDocIconPng} alt="google_doc" />
    </span>
  )
}