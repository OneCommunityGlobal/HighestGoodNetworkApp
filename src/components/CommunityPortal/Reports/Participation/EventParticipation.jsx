import { useSelector } from 'react-redux';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import './Participation.css';

function LandingPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div
      className={`participation-landing-page ${darkMode ? 'participation-landing-page-dark' : ''}`}
    >
      <header>
        <h1 className={`landing-page-header ${darkMode ? 'landing-page-header-dark' : ''}`}>
          HGN Management System
        </h1>
      </header>
      <MyCases />
      <div className="analytics-section">
        <DropOffTracking />
        <NoShowInsights />
      </div>
    </div>
  );
}

export default LandingPage;
