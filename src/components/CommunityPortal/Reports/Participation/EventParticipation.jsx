import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import './Participation.css';

function LandingPage() {
  return (
    <div className="participation-landing-page">
      <header>
        <h1>HGN Management System</h1>
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
