import { toast } from 'react-toastify';
import googleDocIconPng from '../../../assets/images/google_doc_icon.png';
import './style.css';

export default function GoogleDocIcon({ link }) {
  const handleGoogleDocClick = (e) => {
    const toastGoogleLinkDoesNotExist = 'toast-on-click';
    if (!link) {
      e.preventDefault(); //prevent browser default behavior
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
    <a
      href={link || '#'}
      onClick={handleGoogleDocClick}
      onAuxClick={handleGoogleDocClick} //add onAuxClick to handle middle click(mouse wheel)
      target='_blank'
      rel='noopener noreferrer'
      className='team-member-tasks-user-report-link'
    >
      <img
        className={`google-doc-icon ${link ? '' : 'inactive'}`}
        src={googleDocIconPng}
        alt="google_doc"
      />
    </a>
  );
}
