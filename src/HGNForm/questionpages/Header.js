import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <img src="logo.webp" alt="HGN Logo" className="logo" />
      <div className="nav-user-container">
        <nav className="nav">
          <a href="/">Dashboard</a>
          <a href="/">BM Dashboard</a>
          <a href="/">Timelog</a>
          <a href="/">Project</a>
          <a href="/">Reports</a>
        </nav>
        <div className="user">
          <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
          <span>Welcome, BM&apos;s Name</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
