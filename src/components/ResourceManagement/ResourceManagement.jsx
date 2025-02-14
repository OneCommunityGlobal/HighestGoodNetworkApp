import { useState } from 'react';
import './ResourceManagement.css';

function SearchBar() {
  return (
    <div className="search-bar-container">
      <div className="search-bar-left">
        <span className="icon-add">+</span>
        <span className="icon-lines">=</span>
        <span className="icon-toggle">⇅</span>
      </div>
      <div className="search-bar-right">
        <input type="text" className="search-input" placeholder="Search" />
        <button type="button" className="search-button">
          Search
        </button>
      </div>
    </div>
  );
}

function ResourceManagement() {
  const [resources] = useState([
    {
      id: 1,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: 'Just now',
    },
    {
      id: 2,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'CRM Admin pages',
      materials: 'Larry San Francisco',
      date: 'A minute ago',
    },
    {
      id: 3,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '1 hour ago',
    },
    {
      id: 4,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: 'Yesterday',
    },
    {
      id: 5,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'App Landing page',
      materials: 'Nest Lane Olivette',
      date: 'Feb 2, 2024',
    },
    {
      id: 6,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: 'Just now',
    },
    {
      id: 7,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'CRM Admin Pages',
      materials: 'Larry San Francisco',
      date: 'A minute ago',
    },
    {
      id: 8,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '1 hour ago',
    },
    {
      id: 9,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: 'Yesterday',
    },
    {
      id: 10,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'App Landing Page',
      materials: 'Nest Lane Olivette',
      date: 'Feb 2, 2024',
    },
  ]);

  return (
    <div className="resource-management-dashboard">
      <div className="dashboard-title">
        <h2>Used Resources</h2>
        <button type="button" className="add-log-button">
          Add New Log
        </button>
      </div>

      <SearchBar />

      <div className="resource-list">
        <div className="resource-heading">
          <div className="checkbox-container">
            <input type="checkbox" />
          </div>
          <div className="resource-heading-item">User</div>
          <div className="resource-heading-item">Time/Duration</div>
          <div className="resource-heading-item">Facilities</div>
          <div className="resource-heading-item">Materials</div>
          <div className="resource-heading-item">Date</div>
        </div>
        <hr />

        {resources.map(resource => (
          <div key={resource.id}>
            <div className="resource-item">
              <div className="checkbox-container">
                <input type="checkbox" />
              </div>
              <div className="resource-item-detail">{resource.user}</div>
              <div className="resource-item-detail">{resource.timeDuration}</div>
              <div className="resource-item-detail">{resource.facilities}</div>
              <div className="resource-item-detail">{resource.materials}</div>
              <div className="resource-item-detail">
                <span className="calendar-icon">📅</span> {resource.date}
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>

      <div className="pagination">
        <button type="button" className="arrow-button">
          ←
        </button>
        <button type="button">1</button>
        <button type="button">2</button>
        <button type="button">3</button>
        <button type="button">4</button>
        <button type="button">5</button>
        <button type="button" className="arrow-button">
          →
        </button>
      </div>
    </div>
  );
}

export default ResourceManagement;
