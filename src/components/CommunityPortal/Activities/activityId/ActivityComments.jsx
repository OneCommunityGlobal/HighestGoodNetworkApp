import React, { useState } from 'react';
import styles from './ActivityComments.module.css';

const mockEvent = {
  name: 'Event Name',
  location: 'San Francisco, CA 94108',
  link: 'https://devforum.zoom.us',
  date: 'Monday, Sept 2',
  time: '9:00 AM - 11:00 AM EDT',
  organizer: 'Alex Brain',
  capacity: '7 / 20',
  rating: 4,
  status: 'Activated',
  avatars: [
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/45.jpg',
    'https://randomuser.me/api/portraits/women/46.jpg',
    'https://randomuser.me/api/portraits/men/47.jpg',
    'https://randomuser.me/api/portraits/women/48.jpg',
  ],
};

const mockComments = Array.from({ length: 3 }).map((_, idx) => ({
  id: idx + 1,
  name: 'Jane Doe',
  profilePic: 'https://randomuser.me/api/portraits/women/44.jpg',
  timestamp: '5 min ago',
  text:
    'this is activity comments. this is activity comments this is activity comments this is activity comments this is activity comments this is activity comments this is activity comments this is activity comments',
  visibility: 'Public',
  upvotes: 1,
  downvotes: 0,
}));

function ActivityComments() {
  const [activeTab, setActiveTab] = useState('Engagement');
  const [commentTab, setCommentTab] = useState('Comment');
  const [comments, setComments] = useState(mockComments);
  const [commentInput, setCommentInput] = useState('');
  const [sortType, setSortType] = useState('Newest');

  const handlePostComment = () => {
    if (!commentInput.trim()) return;
    setComments([
      {
        id: comments.length + 1,
        name: 'Jane Doe',
        profilePic: 'https://randomuser.me/api/portraits/women/44.jpg',
        timestamp: 'Just now',
        text: commentInput,
        visibility: 'Public',
        upvotes: 0,
        downvotes: 0,
      },
      ...comments,
    ]);
    setCommentInput('');
  };

  return (
    <div>
      {/* Event Card */}
      <div className={styles.eventCard}>
        <div>
          <div className={styles.eventImage}>Finished</div>
        </div>
        <div className={styles.eventDetails}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 8 }}>
            <span className={styles.eventMetaItem}>Event</span>
            <span className={styles.eventMetaItem}>/ In-person</span>
          </div>
          <div className={styles.eventTitle}>{mockEvent.name}</div>
          <div className={styles.eventMeta}>
            <span className={styles.eventMetaItem}>Location: {mockEvent.location}</span>
            <span className={styles.eventMetaItem}>
              Link:{' '}
              <a href={mockEvent.link} target="_blank" rel="noopener noreferrer">
                {mockEvent.link}
              </a>
            </span>
          </div>
          <div className={styles.eventMeta}>
            <span className={styles.eventMetaItem}>Date: {mockEvent.date}</span>
            <span className={styles.eventMetaItem}>Time: {mockEvent.time}</span>
            <span className={styles.eventMetaItem}>Organizer: {mockEvent.organizer}</span>
          </div>
          <div className={styles.eventMeta}>
            <span className={styles.eventMetaItem}>Capacity: {mockEvent.capacity}</span>
            <span className={styles.eventMetaItem}>
              Overall Rating: {'★'.repeat(mockEvent.rating) + '☆'.repeat(5 - mockEvent.rating)}
            </span>
            <span className={styles.eventStatus}>Activated</span>
          </div>
          <div className={styles.eventAvatars}>
            {mockEvent.avatars.map((src, i) => (
              <img key={i} src={src} alt="avatar" className={styles.avatar} />
            ))}
            <span style={{ color: '#888', fontSize: '1rem', marginLeft: 4 }}>+5</span>
          </div>
        </div>
        <div className={styles.calendar}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>September 2024</div>
          <table style={{ width: '100%', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ color: '#888' }}>
                <th>S</th>
                <th>M</th>
                <th>T</th>
                <th>W</th>
                <th>T</th>
                <th>F</th>
                <th>S</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>7</td>
              </tr>
              <tr>
                <td>8</td>
                <td>9</td>
                <td>10</td>
                <td>11</td>
                <td>12</td>
                <td>13</td>
                <td>14</td>
              </tr>
              <tr>
                <td>15</td>
                <td>16</td>
                <td>17</td>
                <td>18</td>
                <td>19</td>
                <td>20</td>
                <td>21</td>
              </tr>
              <tr>
                <td>22</td>
                <td>23</td>
                <td>24</td>
                <td>25</td>
                <td>26</td>
                <td>27</td>
                <td>28</td>
              </tr>
              <tr>
                <td>29</td>
                <td>30</td>
                <td colSpan={5}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'Description' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('Description')}
        >
          Description
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'Analysis' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('Analysis')}
        >
          Analysis
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'Resource' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('Resource')}
        >
          Resource
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'Engagement' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('Engagement')}
        >
          Engagement
        </button>
      </div>

      {/* Engagement Tab Content */}
      {activeTab === 'Engagement' && (
        <div>
          <div className={styles.commentTabs}>
            <button
              className={`${styles.commentTabBtn} ${
                commentTab === 'Comment' ? styles.commentTabBtnActive : ''
              }`}
              onClick={() => setCommentTab('Comment')}
            >
              Comment
            </button>
            <button
              className={`${styles.commentTabBtn} ${
                commentTab === 'Feedback' ? styles.commentTabBtnActive : ''
              }`}
              onClick={() => setCommentTab('Feedback')}
            >
              Feedback
            </button>
          </div>

          {/* Comment Section */}
          {commentTab === 'Comment' && (
            <div>
              <div className={styles.commentHeaderRow}>
                <span className={styles.commentCount}>
                  Comment <span style={{ color: '#888', fontWeight: 400 }}>25</span>
                </span>
                <button className={styles.sortBtn}>
                  <span style={{ fontSize: '1.1em' }}>⇅</span> Sort
                </button>
              </div>
              <div className={styles.commentBox}>
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="profile"
                  className={styles.commentProfilePic}
                />
                <textarea
                  className={styles.commentInput}
                  rows={2}
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                />
                <button className={styles.postBtn} onClick={handlePostComment}>
                  Post
                </button>
              </div>
              <div className={styles.commentsList}>
                {comments.map(comment => (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentTopRow}>
                      <img
                        src={comment.profilePic}
                        alt="profile"
                        className={styles.commentProfilePic}
                      />
                      <span className={styles.commentName}>{comment.name}</span>
                      <span className={styles.commentTimestamp}>{comment.timestamp}</span>
                      <span className={styles.commentVisibility}>{comment.visibility}</span>
                    </div>
                    <div className={styles.commentText}>{comment.text}</div>
                    <div className={styles.commentActionsRow}>
                      <button className={styles.upvoteBtn}>
                        <span style={{ fontSize: '1.1em' }}>↑</span>
                      </button>
                      <button className={styles.downvoteBtn}>
                        <span style={{ fontSize: '1.1em' }}>↓</span>
                      </button>
                      <button className={styles.replyBtn}>
                        <span style={{ fontSize: '1.1em' }}>💬</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className={styles.loadMoreBtn}>Load More</button>
            </div>
          )}

          {/* Feedback Section */}
          {commentTab === 'Feedback' && (
            <div style={{ padding: '32px', color: '#888' }}>Feedback section coming soon.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityComments;
