/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
import { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVillage, setSelectedVillage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample data - replace with actual API call
  const properties = [
    { id: 405, village: 'Earthbag Village', type: 'Unit' },
    { id: 403, village: 'Straw Bale Village', type: 'Unit' },
    { id: 203, village: 'Recycle Materials Village', type: 'Unit' },
    { id: 101, village: 'Cob Village', type: 'Unit' },
    { id: 105, village: 'Earthbag Village', type: 'Unit' },
  ];

  // Pagination logic
  const itemsPerPage = 4;
  const pageCount = Math.ceil(properties.length / itemsPerPage);

  const handlePageChange = newPage => {
    setCurrentPage(Math.max(1, Math.min(newPage, pageCount)));
  };

  return (
    <div className="property-listings">
      <header className="main-header">
        <h1>FOR THE HIGHEST GOOD OF ALL</h1>
      </header>

      <div className="controls-container">
        <div className="filter-section">
          <select
            className="village-filter"
            value={selectedVillage}
            onChange={e => setSelectedVillage(e.target.value)}
          >
            <option value="">Filter by Village</option>
            <option value="Earthbag">Earthbag</option>
            <option value="Straw Bale">Straw Bale</option>
            <option value="Recycle Materials">Recycle Materials</option>
            <option value="Cob">Cob</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      <div className="welcome-message">
        <h2>WELCOME USER_NAME</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <div className={`properties-container ${viewMode}-view`}>
          {properties.map(property => (
            <div key={property.id} className="property-card">
              <div className="property-image">{/* Add image component here */}</div>
              <div className="property-details">
                <h3>
                  {property.type} {property.id}
                </h3>
                <p>{property.village}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pagination-controls">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {pageCount}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Home;
