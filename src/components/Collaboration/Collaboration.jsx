import { Component } from 'react';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import { connect } from 'react-redux';

import 'leaflet/dist/leaflet.css';
import 'react-day-picker/dist/style.css';
import QuestionnaireForm from './QuestionnaireForm.jsx';

// <-- import form

/* eslint-disable */
class Collaboration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      selectedCategory: '',
      currentPage: 1,
      jobAds: [],
      totalPages: 0,
      categories: [],
      summaries: null,
      summariesAll: [],
      summariesPage: 1,
      summariesPageSize: 6,
      summariesTotalPages: 0,
      columns: this.getColumnsFromMQ(),
    };
  }

  componentDidMount() {
    this.fetchJobAds();
    this.fetchCategories();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  getColumnsFromMQ = () => {
    if (window.matchMedia('(min-width: 1600px)').matches) return 6;
    if (window.matchMedia('(min-width: 1300px)').matches) return 5;
    if (window.matchMedia('(min-width: 1017px)').matches) return 4;
    if (window.matchMedia('(min-width: 768px)').matches) return 3;
    if (window.matchMedia('(min-width: 480px)').matches) return 2;
    return 1;
  };

  calculateAdsPerPage = () => {
    const rows = 5;
    return this.state.columns * rows;
  };

  fetchJobAds = async () => {
    const { searchTerm, selectedCategory, currentPage } = this.state;
    const adsPerPage = this.calculateAdsPerPage();

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}` +
          `&search=${encodeURIComponent(searchTerm)}` +
          `&category=${encodeURIComponent(selectedCategory)}`,
        { method: 'GET' },
      );

      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.statusText}`);

      const data = await response.json();
      this.setState({
        jobAds: Array.isArray(data?.jobs) ? data.jobs : [],
        totalPages: data?.pagination?.totalPages || 0,
      });
    } catch (error) {
      toast.error('Error fetching jobs');
    }
  };

  fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);

      const data = await response.json();
      const sorted = Array.isArray(data?.categories)
        ? [...data.categories].sort((a, b) => a.localeCompare(b))
        : [];
      this.setState({ categories: sorted });
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  handleSearch = e => this.setState({ searchTerm: e.target.value });

  handleSubmit = e => {
    e.preventDefault();
    this.setState({ summaries: null, currentPage: 1 }, this.fetchJobAds);
  };

  handleCategoryChange = e => {
    const selectedValue = e.target.value;
    this.setState(
      { selectedCategory: selectedValue || '', currentPage: 1, summaries: null },
      this.fetchJobAds,
    );
  };

  handleResetFilters = async () => {
    try {
      const adsPerPage = this.calculateAdsPerPage();
      const response = await fetch(`${ApiEndpoint}/jobs/reset-filters?page=1&limit=${adsPerPage}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error(`Failed to reset filters: ${response.statusText}`);

      const data = await response.json();
      this.setState({
        searchTerm: '',
        selectedCategory: '',
        currentPage: 1,
        jobAds: Array.isArray(data?.jobs) ? data.jobs : [],
        totalPages: data?.pagination?.totalPages || 0,
        summaries: null,
        summariesAll: [],
        summariesPage: 1,
        summariesTotalPages: 0,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('Error resetting filters');
    }
  };

  setPage = pageNumber => {
    this.setState({ currentPage: pageNumber }, this.fetchJobAds);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  debounce = (fn, ms = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  handleResize = this.debounce(() => {
    const newCols = this.getColumnsFromMQ();
    if (newCols === this.state.columns) return;
    this.setState({ columns: newCols, currentPage: 1 }, this.fetchJobAds);
  }, 200);

  render() {
    const {
      searchTerm,
      selectedCategory,
      currentPage,
      jobAds,
      totalPages,
      categories,
    } = this.state;

    return (
      <div className={`${styles.jobLanding} ${this.props.darkMode ? styles.jobLandingDark : ''}`}>
        <div className={styles.header}>
          <a
            href="https://www.onecommunityglobal.org/collaboration/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={OneCommunityImage}
              alt="One Community Logo"
              className={styles.responsiveImg}
            />
          </a>
        </div>

        <div className={styles.collabContainer}>
          {/* Navbar */}
          <nav className={styles.navbar}>
            <div className={styles.navbarLeft}>
              <form className={styles.searchForm} onSubmit={this.handleSubmit}>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={this.handleSearch}
                />
                <button className={styles.searchButton} type="submit">
                  Go
                </button>
                <button
                  className={styles.resetButton}
                  type="button"
                  onClick={this.handleResetFilters}
                >
                  Reset
                </button>
              </form>
            </div>
            <div className={styles.navbarRight}>
              <select value={selectedCategory} onChange={this.handleCategoryChange}>
                <option value="">Select from Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </nav>

          {/* Job Listings */}
          <div className={styles.headings}>
            <h1>Like to Work With Us? Apply Now!</h1>
            <p>Learn about who we are and who we want to work with!</p>
          </div>

          <div className={styles.jobList}>
            {jobAds.length > 0 ? (
              jobAds.map(ad => (
                <div key={ad._id} className={styles.jobAd}>
                  <img
                    src={
                      ad.imageUrl ||
                      `/api/placeholder/640/480?text=${encodeURIComponent(
                        ad.category || 'Job Opening',
                      )}`
                    }
                    alt={ad.title || 'Job image'}
                    loading="lazy"
                  />
                  <a
                    href={`https://www.onecommunityglobal.org/collaboration/seeking-${(
                      ad.category || ''
                    ).toLowerCase()}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <h3>
                      {ad.title} - {ad.category}
                    </h3>
                  </a>
                </div>
              ))
            ) : (
              <p className={styles.noJobads}>No matching jobs found.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => this.setPage(i + 1)}
                  disabled={currentPage === i + 1}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Questionnaire Form at the end */}
          <QuestionnaireForm />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps)(Collaboration);
