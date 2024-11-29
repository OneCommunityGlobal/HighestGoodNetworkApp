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
      categories: [],
      jobAdsByCategories: {},
    };
  }

  componentDidMount() {
    this.fetchJobAds();
    this.fetchCategories();
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
      console.log('inside fetchJobAds: data', data);
    } catch (error) {
      toast.error('Error fetching jobs');
    }
  };

  fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b));
      this.setState({ categories: sortedCategories });
      console.log('inside fetchCategories: sortedCategories', sortedCategories);
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  handleSearch = event => {
    this.setState({ searchTerm: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ currentPage: 1 }, this.fetchJobAds);
  };

  handleCategoryChange = event => {
    this.setState({ selectedCategory: event.target.value, currentPage: 1 }, this.fetchJobAds);
  };

  setPage = pageNumber => {
    this.setState({ currentPage: pageNumber }, this.fetchJobAds);
  };

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
              <form className="search-form">
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={this.handleSearch}
                />
                <button className="search" type="submit" onClick={this.handleSubmit}>
                  Go
                </button>
              </form>
            </div>

            <div className="navbar-right">
              <select value={selectedCategory} onChange={event => this.handleCategoryChange(event)}>
                <option value="" disabled>
                  Select from Categories
                </option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
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
