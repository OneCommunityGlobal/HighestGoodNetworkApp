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
        <button type="button" className="search-button">Search</button>
      </div>
    </div>
  );
}

function ResourceManagement() {
  const [resources] = useState([
    {
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: 'Just now',
    },
    {
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'CRM Admin pages',
      materials: 'Larry San Francisco',
      date: 'A minute ago',
    },
    {
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '1 hour ago',
    },
    {
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: 'Yesterday',
    },
    {
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'App Landing page',
      materials: 'Nest Lane Olivette',
      date: 'Feb 2, 2024',
    },
    {
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: 'Just now',
    },
    {
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'CRM Admin Pages',
      materials: 'Larry San Francisco',
      date: 'A minute ago',
    },
    {
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '1 hour ago',
    },
    {
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: 'Yesterday',
    },
    {
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
        <button className="add-log-button">Add New Log</button>
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

        {resources.map((resource, index) => (
          <div key={index}>
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
        <button type="button" className="arrow-button">←</button>
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>4</button>
        <button>5</button>
        <button className="arrow-button">→</button>
      </div>
    </div>
  );
}

export default ResourceManagement;
