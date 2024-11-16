import { Component } from 'react';
import './Collaboration.css';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';

class Collaboration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      selectedCategory: '',
      currentPage: 1,
      jobAds: [],
    };
  }

  componentDidMount() {
    this.fetchJobAds();
  }

  fetchJobAds = async () => {
    const response = await fetch(`http://localhost:4500/api/jobs`);
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.statusText}`);
    }
    const data = await response.json();
    this.setState({
      jobAds: data.jobs,
    });
  };

  handleSearch = event => {
    this.setState({ searchTerm: event.target.value });
  };

  handleCategoryChange = event => {
    this.setState({ selectedCategory: event.target.value });
  };

  setPage = pageNumber => {
    this.setState({ currentPage: pageNumber });
  };

  render() {
    const { searchTerm, selectedCategory, currentPage, jobAds } = this.state;
    const adsPerPage = 18;

    // Filtering and pagination logic
    const filteredAds = jobAds
      .filter(ad => ad.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(ad => (selectedCategory ? ad.category === selectedCategory : true));

    const paginatedAds = filteredAds.slice(
      (currentPage - 1) * adsPerPage,
      currentPage * adsPerPage,
    );
    const totalPages = Math.ceil(filteredAds.length / adsPerPage);

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
            {paginatedAds.map(ad => (
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
