import { Search, MoreHorizontal, ChevronDown } from 'lucide-react';
import './IssueHeader.css';
import { connect } from 'react-redux';
import { getHeaderData } from 'actions/authActions';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function IssueHeader(props) {
  const { profilePic, firstName } = props.auth;
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="issue-header-container">
      <div className="top-row">
        <div className="title-section">
          <h1>Issues</h1>
        </div>

        <div className="action-section">
          <button type="button" className="more-button" aria-label="More options">
            <MoreHorizontal size={20} />
          </button>
          <Link to="/bmdashboard/projects" style={{ textDecoration: 'none' }}>
            <button className="back-button" aria-label="Back to Project" type="button">
              Back to Projects
            </button>
          </Link>
          <div className="avatar">
            {profilePic ? (
              <img src={profilePic} alt={`${firstName}'s avatar`} />
            ) : (
              <img src="/pfp-default-header.png" alt="Default avatar" />
            )}
            <ChevronDown size={20} color="#828282" />
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="project-tab">
          <button
            type="button"
            className={`tab-item ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Project 1
          </button>
          <button
            type="button"
            className={`tab-item ${activeTab === 'dates' ? 'active' : ''}`}
            onClick={() => setActiveTab('dates')}
          >
            Dates of Project 1
          </button>
        </div>

        <div className="search-container">
          <div className="search-icon">
            <Search size={20} />
          </div>
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  taskEditSuggestionCount: state.taskEditSuggestions.count,
  role: state.role,
  notification: state.notification,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {
  getHeaderData,
})(IssueHeader);
