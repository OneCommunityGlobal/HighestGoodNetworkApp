import { Search, MoreHorizontal, ChevronDown } from 'lucide-react';
import styles from './IssueHeader.module.css';
import { connect, useDispatch, useSelector } from 'react-redux';
import { getHeaderData, logoutUser } from '~/actions/authActions';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap';
import DarkModeButton from '~/components/Header/DarkModeButton';
import { cantUpdateDevAdminDetails } from '~/utils/permissions';
import { WELCOME, VIEW_PROFILE, UPDATE_PASSWORD, LOGOUT } from '~/languages/en/ui';
import Logout from '~/components/Logout/Logout';

export function IssueHeader(props) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const { profilePic, firstName, user } = props.auth;
  const projects = useSelector(state => state.bmProjects);
  const userProfile = useSelector(state => state.userProfile);

  const [activeTab, setActiveTab] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const searchRef = useRef(null);

  const userId = user?.userid || user?.id;

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  const filteredProjects = isSearchFocused
    ? searchTerm
      ? projects.filter(project => project.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : projects
    : [];

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
    <div className={darkMode ? styles.issueHeaderContainerDark : styles.issueHeaderContainer}>
      <div className={darkMode ? styles.topRowDark : styles.topRow}>
        <div className={darkMode ? styles.titleSectionDark : styles.titleSection}>
          <h1 className={darkMode ? styles.sectionDark : styles.section}>Issues</h1>
        </div>

        <div className={styles.actionSection}>
          <UncontrolledDropdown>
            <DropdownToggle
              tag="button"
              className={darkMode ? styles.moreButtonDark : styles.moreButton}
              type="button"
            >
              <MoreHorizontal size={20} color={darkMode ? '#ffffff' : '#000000'} />
            </DropdownToggle>
            <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
              <DropdownItem header className={darkMode ? 'text-light' : ''}>
                More Options
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem
                tag={Link}
                to="/bmdashboard/issues"
                className={darkMode ? 'text-light' : ''}
              >
                View All Issues
              </DropdownItem>
              <DropdownItem
                tag={Link}
                to="/bmdashboard/projects"
                className={darkMode ? 'text-light' : ''}
              >
                Projects
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <Link to="/bmdashboard/projects" style={{ textDecoration: 'none' }}>
            <button className={darkMode ? styles.backButtonDark : styles.backButton} type="button">
              Back to Projects
            </button>
          </Link>
          <UncontrolledDropdown>
            <DropdownToggle
              tag="div"
              className={styles.avatar}
              style={{ cursor: 'pointer' }}
              caret={false}
            >
              {profilePic ? (
                <img src={profilePic} alt={`${firstName}'s avatar`} />
              ) : (
                <img src="/pfp-default-header.png" alt="Default avatar" />
              )}
            </DropdownToggle>
            <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
              <DropdownItem header className={darkMode ? 'text-light' : ''}>
                Hello {firstName}
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem
                tag={Link}
                to={`/userprofile/${userId}`}
                className={darkMode ? 'text-light' : ''}
              >
                {VIEW_PROFILE}
              </DropdownItem>
              {!cantUpdateDevAdminDetails(userProfile?.email, userProfile?.email) && (
                <DropdownItem
                  tag={Link}
                  to={`/updatepassword/${userId}`}
                  className={darkMode ? 'text-light' : ''}
                >
                  {UPDATE_PASSWORD}
                </DropdownItem>
              )}
              <DropdownItem className={darkMode ? 'text-light' : ''}>
                <DarkModeButton />
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem
                onClick={() => setLogoutPopup(true)}
                className={darkMode ? 'text-light' : ''}
              >
                {LOGOUT}
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      </div>

      <div className={darkMode ? styles.bottomRowDark : styles.bottomRow}>
        <div className={darkMode ? styles.projectTabDark : styles.projectTab}>
          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'info' ? 'active' : ''} ${
              darkMode ? styles.tabItemDark : ''
            }`}
            onClick={() => setActiveTab('info')}
          >
            Project Info
          </button>
          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'dates' ? 'active' : ''} ${
              darkMode ? styles.tabItemDark : ''
            }`}
            onClick={() => setActiveTab('dates')}
          >
            Project Dates
          </button>
        </div>

        <div className={styles.searchContainer} ref={searchRef}>
          <div className={darkMode ? styles.searchIconDark : styles.searchIcon}>
            <Search size={20} color={darkMode ? '#ffffff' : '#828282'} />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            className={darkMode ? styles.searchInputDark : styles.searchInput}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />

          {isSearchFocused && (
            <div className={darkMode ? styles.searchResultsDark : styles.searchResults}>
              {filteredProjects.length > 0 ? (
                <div className={styles.searchResultsList}>
                  {filteredProjects.map(project => (
                    <Link
                      to={`/bmdashboard/projects/${project._id}`}
                      key={project._id || project.id}
                      style={{ textDecoration: 'none' }}
                      onClick={() => {
                        setIsSearchFocused(false);
                        setSearchTerm('');
                      }}
                    >
                      <div
                        className={darkMode ? styles.searchResultItemDark : styles.searchResultItem}
                      >
                        <span className={darkMode ? styles.resultNameDark : styles.resultName}>
                          {project.name}
                        </span>
                        <span
                          className={darkMode ? styles.resultCategoryDark : styles.resultCategory}
                        >
                          {project.category || 'No category'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={darkMode ? styles.searchNoResultsDark : styles.searchNoResults}>
                  {searchTerm ? 'No matching projects found' : 'Start typing to search projects'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Logout setLogoutPopup={setLogoutPopup} open={logoutPopup} />
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
