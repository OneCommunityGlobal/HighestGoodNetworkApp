import { Search, MoreHorizontal, ChevronDown } from 'lucide-react';
import './IssueHeader.css';
import { connect, useDispatch, useSelector } from 'react-redux';
import { getHeaderData } from '~/actions/authActions';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';

export function IssueHeader(props) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const { profilePic, firstName } = props.auth;
  const projects = useSelector(state => state.bmProjects);

  const [activeTab, setActiveTab] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`${darkMode ? 'issue-header-container-dark' : 'issue-header-container '}`}>
      <div className="top-row">
        <div className={`${darkMode ? 'title-section-dark' : 'title-section'}`}>
          <h1 className={`${darkMode ? 'section-dark' : 'section'}`}>Issues</h1>
        </div>

        <div className="action-section">
          <button className="more-button" type="button" label="More Button">
            <MoreHorizontal size={20} />
          </button>
          <Link to="/projects" style={{ textDecoration: 'none' }}>
            <button className="back-button" type="button">
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

      <div className={`${darkMode ? 'bg-oxide-blue' : ''} 'top-row-dark'`}>
        <div className={` project-tab`}>
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

        <div className="search-container" ref={searchRef}>
          <div className="search-icon">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />

          {searchTerm && isSearchFocused && (
            <div className="search-results">
              {filteredProjects.length > 0 ? (
                <div className="search-results-list">
                  {filteredProjects.map(project => (
                    <Link
                      to={`/bmdashboard/projects/${project._id}`}
                      key={project.id}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="search-result-item">
                        <span className="result-name">{project.name}</span>
                        <span className="result-category">{project.category}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="search-no-results">No matching projects found</div>
              )}
            </div>
          )}
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
