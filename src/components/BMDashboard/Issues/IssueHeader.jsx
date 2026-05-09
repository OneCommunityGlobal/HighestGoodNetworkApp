import { Search, MoreHorizontal, ChevronDown } from 'lucide-react';
import styles from './IssueHeader.module.css';
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
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.issueHeaderContainer}`}>
        <div className={`${styles.topRow}`}>
          <div className={`${styles.titleSection}`}>
            <h1 className={`${styles.section}`}>Issues</h1>
          </div>

          <div className={`${styles.actionSection}`}>
            <button className={`${styles.moreButton}`} type="button" label="More Button">
              <MoreHorizontal size={20} />
            </button>
            <Link to="/bmdashboard/projects" style={{ textDecoration: 'none' }}>
              <button className={`${styles.backButton}`} type="button">
                Back to Projects
              </button>
            </Link>
            <div className={`${styles.avatar}`}>
              {profilePic ? (
                <img src={profilePic} alt={`${firstName}'s avatar`} />
              ) : (
                <img src="/pfp-default-header.png" alt="Default avatar" />
              )}
              <ChevronDown size={20} color="#828282" />
            </div>
          </div>
        </div>

        <div className={`${styles.topRow}`}>
          <div className={`${styles.projectTab}`}>
            <button
              type="button"
              className={`${styles.tabItem} ${activeTab === 'info' ? styles.active : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Project 1
            </button>
            <button
              type="button"
              className={`${styles.tabItem} ${activeTab === 'dates' ? styles.active : ''}`}
              onClick={() => setActiveTab('dates')}
            >
              Dates of Project 1
            </button>
          </div>

          <div className={`${styles.searchContainer}`} ref={searchRef}>
            <div className={`${styles.searchIcon}`}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className={`${styles.searchInput}`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />

            {searchTerm && isSearchFocused && (
              <div className={`${styles.searchResults}`}>
                {filteredProjects.length > 0 ? (
                  <div className={`${styles.searchResultsList}`}>
                    {filteredProjects.map(project => (
                      <Link
                        to={`/bmdashboard/projects/${project._id}`}
                        key={project.id}
                        style={{ textDecoration: 'none' }}
                      >
                        <div className={`${styles.searchResultItem}`}>
                          <span className={`${styles.resultName}`}>{project.name}</span>
                          <span className={`${styles.resultCategory}`}>{project.category}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className={`${styles.searchNoResults}`}>No matching projects found</div>
                )}
              </div>
            )}
          </div>
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
