import { Component } from 'react';
import './Collaboration.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from 'utils/URL';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';

class Collaboration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      selectedCategory: '',
      currentPage: 1,
      jobAds: [],
      totalPages: 0,
    };
  }

  componentDidMount() {
    this.fetchJobAds();
  }

  fetchJobAds = async () => {
    const { searchTerm, selectedCategory, currentPage } = this.state;
    const adsPerPage = 18;

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${searchTerm}&category=${selectedCategory}`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      this.setState({
        jobAds: data.jobs,
        totalPages: data.pagination.totalPages, // Update total pages from the backend
      });
    } catch (error) {
      toast.error('Error fetching jobs');
    }
  };

  handleSearch = event => {
    this.setState({ searchTerm: event.target.value, currentPage: 1 }, this.fetchJobAds);
  };

  handleCategoryChange = event => {
    this.setState({ selectedCategory: event.target.value, currentPage: 1 }, this.fetchJobAds);
  };

  setPage = pageNumber => {
    this.setState({ currentPage: pageNumber }, this.fetchJobAds);
  };

  render() {
    const { searchTerm, selectedCategory, currentPage, jobAds, totalPages } = this.state;

    return (
      <div className="job-landing">
        <div className="header">
          <a
            href="https://www.onecommunityglobal.org/collaboration/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={OneCommunityImage} alt="One Community Logo" />
          </a>
        </div>
        <div className="container">
          <nav className="navbar">
            <div className="navbar-left">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={this.handleSearch}
              />
              <select value={selectedCategory} onChange={this.handleCategoryChange}>
                <option value="">All Categories</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </nav>

          <div className="headings">
            <h1>Like to Work With Us? Apply Now!</h1>
            <p>Learn about who we are and who we want to work with!</p>
          </div>

          <div className="job-list">
            {jobAds.map(ad => (
              <div key={ad._id} className="job-ad">
                <img src={ad.imageUrl} alt={`${ad.title}`} />
                <a
                  href={`https://www.onecommunityglobal.org/collaboration/seeking-${ad.category.toLowerCase()}`}
                >
                  <h3>
                    {ad.title} - {ad.category}
                  </h3>
                </a>
              </div>
            ))}
          </div>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => this.setPage(i + 1)}
                disabled={currentPage === i + 1}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Collaboration;
