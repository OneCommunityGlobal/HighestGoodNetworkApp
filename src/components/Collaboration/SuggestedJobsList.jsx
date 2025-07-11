import { useEffect, useState } from 'react';
import { ApiEndpoint } from 'utils/URL';
import { toast } from 'react-toastify';
import OneCommunityImage from '../../assets/images/logo2.png';
import './SuggestedJobsList.css';

function SuggestedJobsList() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [jobAds, setJobAds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const adsPerPage = 3;

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
        if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);
        const data = await response.json();
        const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b));
        setCategories(sortedCategories);
      } catch (error) {
        toast.error('Error fetching categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch job ads whenever query, category or page changes
  useEffect(() => {
    if (!query && !category) {
      setJobAds([]); // Clear jobs if no filters selected
      setTotalPages(0);
      return; // Skip fetching
    }

    const fetchJobAds = async () => {
      try {
        const url = `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${encodeURIComponent(
          query,
        )}&category=${encodeURIComponent(category)}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.statusText}`);
        const data = await response.json();
        setJobAds(data.jobs);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        toast.error('Error fetching jobs');
      }
    };

    fetchJobAds();
  }, [query, category, currentPage]);

  // Handle form submission for search
  const handleSubmit = e => {
    e.preventDefault();
    setCurrentPage(1); // Reset page to 1 on new search
    setQuery(e.target.elements.searchInput.value.trim());
  };

  // Handle category change
  const handleCategoryChange = e => {
    setCategory(e.target.value);
    setCurrentPage(1); // Reset page to 1 on category change
  };

  // Pagination controls
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const getCategoryIcon = jobType => {
    switch (jobType) {
      case 'Engineering':
        return 'https://img.icons8.com/external-prettycons-flat-prettycons/47/external-job-social-media-prettycons-flat-prettycons.png';
      case 'Marketing':
        return 'https://img.icons8.com/external-justicon-lineal-color-justicon/64/external-marketing-marketing-and-growth-justicon-lineal-color-justicon-1.png';
      case 'Design':
        return 'https://img.icons8.com/arcade/64/design.png';
      case 'Finance':
        return 'https://img.icons8.com/cotton/64/merchant-account--v2.png';
      default:
        return 'https://img.icons8.com/cotton/64/working-with-a-laptop--v1.png';
    }
  };

  return (
    <div className="job-landing">
      <div className="job-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>
      <nav
        className="job-navbar"
        style={{
          maxWidth: '600px',
          margin: '0 auto 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <form className="search-form" style={{ display: 'flex' }} onSubmit={handleSubmit}>
          <input
            name="searchInput"
            type="text"
            placeholder="Search by title..."
            defaultValue={query}
            style={{ padding: '8px' }}
          />
          <button className="btn btn-secondary" type="submit">
            Go
          </button>
        </form>

        <select className="job-select" value={category} onChange={handleCategoryChange}>
          <option value="">Select from Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </nav>

      {/* Job ads listing */}

      <div className="job-grid" style={{ margin: '0 auto' }}>
        {jobAds.length > 0 ? (
          jobAds.map(ad => (
            <div
              key={ad._id}
              className="job-ad"
              style={{
                marginBottom: '20px',
                borderBottom: '1px solid #ccc',
                paddingBottom: '15px',
              }}
            >
              <img
                src={getCategoryIcon(ad.category)}
                alt={`${ad.category} icon`}
                style={{
                  marginBottom: '15px',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                className="category-icon"
              />
              <h2 className="job-role-name">{ad.title}</h2>
              <p className="job-details">
                {ad.description || 'No detailed description available.'}
              </p>
              {ad.requirements && ad.requirements.length > 0 && (
                <div className="job-requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    {ad.requirements.map(req => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              <a
                href={`https://www.onecommunityglobal.org/collaboration/job-application/${ad._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button type="submit" className="btn btn-primary apply-now-btn">
                  Apply Now
                </button>
              </a>
            </div>
          ))
        ) : (
          <div className="no-jobs-notice">
            <h3>No Job Ads Found</h3>
            <p>Try adjusting your search or selecting a different category.</p>
          </div>
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls" style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            style={{ marginRight: '10px' }}
          >
            &lt; Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            style={{ marginLeft: '10px' }}
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
}

export default SuggestedJobsList;
