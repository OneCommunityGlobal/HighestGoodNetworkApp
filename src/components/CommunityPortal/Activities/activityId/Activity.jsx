import React, { useState } from 'react'
import './Activity.css';

function Activity() {

  const [tab, setTab] = useState('Description');

  const handleTabClick = (tabName) => {
    setTab(tabName);
  }

  return (
    <div className="event-card">
      <div className="event-header">
        <div className="event-image">Participated</div>
        <div className="event-details">
          <p className="event-type">Event or Course / In-person or Remote</p>
          <h2 className="event-title">Event Name</h2>
          <p className="event-location">San Francisco, CA 94108</p>
          <a href="https://devforum.zoom.us" className="event-link">
            https://devforum.zoom.us
          </a>
          <div className="event-info">
            <div><strong>Date</strong><br />Monday, Sept 2</div>
            <div><strong>Time</strong><br />9:00 AM - 11:00 AM</div>
            <div><strong>Organizer</strong><br />Alex Brain</div>
            <div><strong>Capacity</strong><br /><span className="capacity">7/20</span></div>
            <div><strong>Overall Rating</strong><br />★★★★☆</div>
            <div><strong>Status</strong><br /><span className="status-active">Activated</span></div>
          </div>
          <div className="event-buttons">
            <button className="feedback-btn">Feedback</button>
            <button className="contact-btn">Contact organizer</button>
          </div>
        </div>
        <div className="calendar-box">
          <div className="calendar-header">September 2024</div>
          <table className="calendar-table">
            <thead>
              <tr>
                <th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td className="active-date">2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
              <tr><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td></tr>
              <tr><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td><td>21</td></tr>
              <tr><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td></tr>
              <tr><td>29</td><td>30</td><td> </td><td> </td><td> </td><td> </td><td> </td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="event-tabs">
        <span className={`tab ${tab === 'Description' ? 'active' : ''}`} onClick={() => handleTabClick('Description')}>Description</span>
        <span className={`tab ${tab === 'Participates' ? 'active' : ''}`} onClick={() => handleTabClick('Participates')}>Participates</span>
        <span className={`tab ${tab === 'Comments' ? 'active' : ''}`} onClick={() => handleTabClick('Comments')}>Comments</span>
        <span className={`tab ${tab === 'FAQs' ? 'active' : ''}`} onClick={() => handleTabClick('FAQs')}>FAQs</span>
      </div>
      {tab === 'Comments' && (
        <div className="comments-section">
          <div className="comment">
            <div className="comment-user">
              <span className="avatar purple">S</span>
              <span className="avatar blue">J</span>
            </div>
            <div className="comment-text">
              this is activity comments. this is activity comments. this is activity comments. this is activity comments. this is activity comments.
            </div>
          </div>
          <div className="comment">
            <div className="comment-user">
              <span className="avatar purple">S</span>
              <span className="avatar blue">J</span>
            </div>
            <div className="comment-text">
              this is activity comments. this is activity comments. this is activity comments. this is activity comments. this is activity comments.
            </div>
          </div>
          <div className="comment">
            <div className="comment-user">
              <span className="avatar purple">S</span>
              <span className="avatar blue">J</span>
            </div>
            <div className="comment-text">
              this is activity comments. this is activity comments. this is activity comments. this is activity comments. this is activity comments.
            </div>
          </div>
          <div className="comment-footer">
            <span>5 min ago</span>
          </div>
        </div>
      )
      }
    </div>
  );
};

export default Activity