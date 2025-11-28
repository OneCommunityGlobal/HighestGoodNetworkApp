import React, { useState, useEffect } from 'react';
import styles from './ActivityComments.module.css';

// Utility function to calculate relative time
const getRelativeTime = createdAt => {
  const now = new Date();
  const diffInMs = now - createdAt;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return diffInSeconds <= 1 ? 'Just now' : `${diffInSeconds} seconds ago`;
  } else if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  } else {
    return createdAt.toLocaleDateString();
  }
};

// Utility function to sanitize user input and prevent XSS
const sanitizeInput = input => {
  if (typeof input !== 'string') return '';

  // Safely remove script tags without vulnerable regex
  let result = input;

  // Remove script tags using a safer approach
  while (result.toLowerCase().includes('<script')) {
    const startIndex = result.toLowerCase().indexOf('<script');
    const endIndex = result.toLowerCase().indexOf('</script>', startIndex);
    if (startIndex !== -1) {
      if (endIndex !== -1) {
        result = result.substring(0, startIndex) + result.substring(endIndex + 9);
      } else {
        result = result.substring(0, startIndex);
      }
    } else {
      break;
    }
  }

  // Remove all HTML tags using a safe iterative approach (no ReDoS risk)
  while (result.includes('<') && result.includes('>')) {
    const startIndex = result.indexOf('<');
    const endIndex = result.indexOf('>', startIndex);
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      result = result.substring(0, startIndex) + result.substring(endIndex + 1);
    } else {
      // If we find < but no matching >, remove everything from < to end
      if (startIndex !== -1) {
        result = result.substring(0, startIndex);
      }
      break;
    }
  }

  // Escape special characters
  result = result.replace(/[<>&"']/g, char => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      case "'":
        return '&#x27;';
      default:
        return char;
    }
  });

  return result.trim().substring(0, 5000); // Limit length to prevent DoS attacks
};

// Utility function to generate secure random numbers for demo purposes
// Utility function to generate secure random numbers for demo purposes
const getSecureRandomInt = (min, max) => {
  // Use a deterministic approach for demo data instead of Math.random()
  // In a real application, you would get this data from a secure API
  const staticValues = [3, 7, 12, 5, 9, 2, 15, 8, 1, 6, 11, 4, 14, 10, 13];
  const index = (min + max) % staticValues.length;
  return Math.min(max, Math.max(min, staticValues[index]));
};

// Random user profiles for variety
const randomUsers = [
  {
    name: 'You',
    profilePic: '/pfp-default.png',
  },
  {
    name: 'John Smith',
    profilePic: '/Portrait_Placeholder.png',
  },
  {
    name: 'Maria Garcia',
    profilePic: '/pfp-default-header.png',
  },
  {
    name: 'James Wilson',
    profilePic: '/profilepic.webp',
  },
];

const mockEvent = {
  name: 'Community Innovation Workshop: Sustainable Tech Solutions',
  location: 'San Francisco, CA 94108',
  link: 'https://devforum.zoom.us',
  date: 'Monday, Sept 2',
  time: '9:00 AM - 11:00 AM EDT',
  organizer: 'Alex Brain',
  capacity: '7 / 20',
  rating: 4,
  status: 'Activated',
  avatars: [
    '/pfp-default.png',
    '/Portrait_Placeholder.png',
    '/pfp-default-header.png',
    '/profilepic.webp',
    '/pfp-default.png',
  ],
};

const mockComments = [
  {
    id: 1,
    name: 'Sarah Wilson',
    profilePic: '/pfp-default.png',
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago (fixed time)
    fixedTimestamp: '2 minutes ago', // Fixed display timestamp
    text:
      'Great event! Really enjoyed the presentation on sustainable development. Looking forward to the next one.',
    visibility: 'Public',
    upvotes: 5,
    downvotes: 0,
    replies: [],
  },
  {
    id: 2,
    name: 'Alex Rodriguez',
    profilePic: '/Portrait_Placeholder.png',
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago (fixed time)
    fixedTimestamp: '15 minutes ago', // Fixed display timestamp
    text:
      'Thanks for organizing this! The networking session was particularly valuable. Made some great connections.',
    visibility: 'Public',
    upvotes: 3,
    downvotes: 0,
    replies: [
      {
        id: 101,
        name: 'Emma Thompson',
        profilePic: '/pfp-default-header.png',
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago (fixed time)
        fixedTimestamp: '10 minutes ago', // Fixed display timestamp
        text: 'I agree! Would love to connect with you on LinkedIn.',
        visibility: 'Public',
      },
    ],
  },
  {
    id: 3,
    name: 'Emma Thompson',
    profilePic: '/pfp-default-header.png',
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago (fixed time)
    fixedTimestamp: '45 minutes ago', // Fixed display timestamp
    text:
      'Could we get the slides shared? I want to review some of the key points discussed during the workshop.',
    visibility: 'Public',
    upvotes: 8,
    downvotes: 1,
    replies: [],
  },
  {
    id: 4,
    name: 'David Kim',
    profilePic: '/profilepic.webp',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (fixed time)
    fixedTimestamp: '2 hours ago', // Fixed display timestamp
    text: 'Excellent speakers and well-organized agenda. The Q&A session was very insightful.',
    visibility: 'Public',
    upvotes: 2,
    downvotes: 0,
    replies: [],
  },
  {
    id: 5,
    name: 'Lisa Chen',
    profilePic: '/pfp-default.png',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago (fixed time)
    fixedTimestamp: '1 day ago', // Fixed display timestamp
    text:
      'This event exceeded my expectations. The practical examples were really helpful for my current project.',
    visibility: 'Public',
    upvotes: 12,
    downvotes: 0,
    replies: [],
  },
];

const mockFeedbacks = [
  {
    id: 1,
    name: 'Sarah Johnson',
    profilePic: '/Portrait_Placeholder.png',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (fixed time)
    fixedTimestamp: '2 hours ago', // Fixed display timestamp that won't change
    rating: 5,
    text:
      'This was an absolutely fantastic event! The organizers did an excellent job planning everything, and the content was extremely valuable. I learned so much and made great connections.',
    helpful: 12,
  },
  {
    id: 2,
    name: 'Anonymous User',
    profilePic: '/pfp-default.png',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago (fixed time)
    fixedTimestamp: '5 hours ago', // Fixed display timestamp that won't change
    rating: 4,
    text:
      'Really enjoyed the event overall. The speakers were knowledgeable and the topics were relevant. The only minor issue was the room was a bit crowded.',
    helpful: 8,
  },
  {
    id: 3,
    name: 'Mike Chen',
    profilePic: '/pfp-default-header.png',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago (fixed time)
    fixedTimestamp: '1 day ago', // Fixed display timestamp that won't change
    rating: 3,
    text:
      'The event was okay. Some parts were interesting but I felt like it could have been better organized. The networking session was good though.',
    helpful: 3,
  },
];

function ActivityComments() {
  // Utility function to restore Date objects from localStorage
  const restoreDates = items => {
    return items.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      replies: item.replies
        ? item.replies.map(reply => ({
            ...reply,
            createdAt: new Date(reply.createdAt),
          }))
        : [],
    }));
  };

  // Load data from localStorage or use mock data as fallback
  const loadStoredComments = () => {
    try {
      const stored = localStorage.getItem('activityComments');
      if (stored) {
        const parsed = JSON.parse(stored);
        return restoreDates(parsed);
      }
      return mockComments;
    } catch (error) {
      return mockComments;
    }
  };

  const loadStoredFeedbacks = () => {
    try {
      const stored = localStorage.getItem('activityFeedbacks');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));
      }
      return mockFeedbacks;
    } catch (error) {
      return mockFeedbacks;
    }
  };

  const [activeTab, setActiveTab] = useState('Engagement');
  const [commentTab, setCommentTab] = useState('Comment');
  const [comments, setComments] = useState(loadStoredComments);
  const [commentInput, setCommentInput] = useState('');
  const [sortType, setSortType] = useState('Newest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [totalComments, setTotalComments] = useState(loadStoredComments().length + 10); // Simulating more comments exist
  const commentsPerPage = 5;

  // Reply states
  const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
  const [replyInput, setReplyInput] = useState(''); // Reply text input

  // Feedback states
  const [feedbacks, setFeedbacks] = useState(loadStoredFeedbacks);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackSort, setFeedbackSort] = useState('Newest');
  const [feedbackFilter, setFeedbackFilter] = useState('All');

  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 8)); // September 2024 (month is 0-indexed)
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 8, 2)); // Sept 2nd, 2024 (event date)

  // Sample event dates for demonstration
  const eventDates = [
    new Date(2024, 8, 2), // Sept 2, 2024 (main event)
    new Date(2024, 8, 15), // Sept 15, 2024
    new Date(2024, 9, 5), // Oct 5, 2024
    new Date(2024, 9, 20), // Oct 20, 2024
    new Date(2024, 7, 25), // Aug 25, 2024
  ];

  // Save comments to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('activityComments', JSON.stringify(comments));
    } catch (error) {
      // Failed to save to localStorage - continue without persistence
    }
  }, [comments]);

  // Save feedbacks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('activityFeedbacks', JSON.stringify(feedbacks));
    } catch (error) {
      // Failed to save to localStorage - continue without persistence
    }
  }, [feedbacks]);

  // Utility function to reset all data (for testing)
  const resetAllData = () => {
    localStorage.removeItem('activityComments');
    localStorage.removeItem('activityFeedbacks');
    setComments(mockComments);
    setFeedbacks(mockFeedbacks);
    setTotalComments(mockComments.length + 10);
  };

  // Mock API function to simulate fetching more comments
  const fetchMoreComments = async page => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate additional mock comments for pagination
    const additionalComments = [
      {
        id: 100 + page * 10 + 1,
        name: 'Michael Johnson',
        profilePic: '/profilepic.webp',
        createdAt: new Date(Date.now() - (page + 5) * 60 * 60 * 1000),
        fixedTimestamp: `${page + 5} hours ago`,
        text: `This is an additional comment from page ${page}. The discussion continues with more insights and perspectives from the community.`,
        visibility: 'Public',
        upvotes: getSecureRandomInt(0, 10),
        downvotes: getSecureRandomInt(0, 3),
        replies: [],
      },
      {
        id: 100 + page * 10 + 2,
        name: 'Jennifer Smith',
        profilePic: '/pfp-default.png',
        createdAt: new Date(Date.now() - (page + 6) * 60 * 60 * 1000),
        fixedTimestamp: `${page + 6} hours ago`,
        text: `Another perspective on this topic. I found the event very educational and would recommend it to others in our field.`,
        visibility: 'Public',
        upvotes: getSecureRandomInt(5, 15),
        downvotes: getSecureRandomInt(0, 2),
        replies: [
          {
            id: 200 + page * 10 + 1,
            name: 'Robert Wilson',
            profilePic: '/Portrait_Placeholder.png',
            createdAt: new Date(Date.now() - (page + 5) * 60 * 60 * 1000),
            fixedTimestamp: `${page + 5} hours ago`,
            text: 'I completely agree! Thanks for sharing your thoughts.',
            visibility: 'Public',
          },
        ],
      },
      {
        id: 100 + page * 10 + 3,
        name: 'Patricia Davis',
        profilePic: '/pfp-default-header.png',
        createdAt: new Date(Date.now() - (page + 7) * 60 * 60 * 1000),
        fixedTimestamp: `${page + 7} hours ago`,
        text: `Great follow-up discussion! Looking forward to implementing some of these ideas in my own work.`,
        visibility: 'Public',
        upvotes: getSecureRandomInt(1, 8),
        downvotes: 0,
        replies: [],
      },
    ];

    return {
      comments: additionalComments,
      hasMore: page < 3, // Simulate having 3 pages total
      total: 20, // Simulate total of 20 comments
    };
  };

  // Handle loading more comments
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreComments) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await fetchMoreComments(nextPage);

      setComments(prevComments => [...prevComments, ...result.comments]);
      setCurrentPage(nextPage);
      setHasMoreComments(result.hasMore);
      setTotalComments(result.total);
    } catch (error) {
      // console.error('Error loading more comments:', error);
      // In a real app, you might show an error message to the user
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePostComment = () => {
    if (!commentInput.trim()) return;

    // Sanitize the input to prevent XSS
    const sanitizedText = sanitizeInput(commentInput);
    if (!sanitizedText) return;

    // Use random user for demonstration (in real app, this would be the current user)
    const randomUser = randomUsers[0]; // Always use "You" for new comments

    const postTime = new Date(); // Timestamp at moment of posting
    const newComment = {
      id: Date.now(), // Use timestamp for unique ID
      name: randomUser.name,
      profilePic: randomUser.profilePic,
      createdAt: postTime, // This will be used by getRelativeTime to show dynamic timestamps
      text: sanitizedText,
      visibility: 'Public',
      upvotes: 0,
      downvotes: 0,
      replies: [], // Initialize empty replies array
    };

    setComments(prevComments => [newComment, ...prevComments]);
    setCommentInput('');
    setTotalComments(prevTotal => prevTotal + 1); // Update total count when new comment is added
  };

  const handleReplyClick = commentId => {
    setReplyingTo(replyingTo === commentId ? null : commentId); // Toggle reply form
    setReplyInput(''); // Clear reply input when toggling
  };

  const handlePostReply = commentId => {
    if (!replyInput.trim()) return;

    // Sanitize the input to prevent XSS
    const sanitizedText = sanitizeInput(replyInput);
    if (!sanitizedText) return;

    const randomUser = randomUsers[0]; // Always use "You" for new replies

    const postTime = new Date(); // Timestamp at moment of posting
    const newReply = {
      id: Date.now(), // Use timestamp for unique ID
      name: randomUser.name,
      profilePic: randomUser.profilePic,
      createdAt: postTime, // This will be used by getRelativeTime to show dynamic timestamps
      text: sanitizedText,
      visibility: 'Public',
    };

    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, newReply] }
          : comment,
      ),
    );

    setReplyInput('');
    setReplyingTo(null); // Close reply form after posting
  };

  const handlePostFeedback = () => {
    if (!feedbackInput.trim()) {
      return;
    }
    if (feedbackRating === 0) {
      return;
    }

    // Sanitize the input to prevent XSS
    const sanitizedText = sanitizeInput(feedbackInput);
    if (!sanitizedText) return;

    const postTime = new Date(); // Fixed timestamp at moment of posting
    const newFeedback = {
      id: Date.now(), // Use timestamp for unique ID
      name: 'Your Name',
      profilePic: '/pfp-default.png',
      createdAt: postTime, // Fixed timestamp that won't change
      fixedTimestamp: 'Just now', // This will remain "Just now" and not update
      rating: feedbackRating,
      text: sanitizedText,
      helpful: 0,
    };

    setFeedbacks(prevFeedbacks => [newFeedback, ...prevFeedbacks]);
    setFeedbackInput('');
    setFeedbackRating(0);
  };

  const handleHelpfulClick = feedbackId => {
    setFeedbacks(prevFeedbacks =>
      prevFeedbacks.map(feedback =>
        feedback.id === feedbackId ? { ...feedback, helpful: feedback.helpful + 1 } : feedback,
      ),
    );
  };

  const handleFlagClick = feedbackId => {
    // In a real application, this would make an API call to report the feedback
    // For now, we'll just silently handle the flag action
    setFeedbacks(prevFeedbacks =>
      prevFeedbacks.map(feedback =>
        feedback.id === feedbackId ? { ...feedback, flagged: true } : feedback,
      ),
    );
  };

  const handleDateClick = date => {
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const isEventDate = date => {
    return eventDates.some(
      eventDate =>
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear(),
    );
  };

  const isSameDate = (date1, date2) => {
    return (
      date1 &&
      date2 &&
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of the month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const renderStars = (rating, isInteractive = false, onRatingChange = null) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            style={{
              fontSize: '1.2rem',
              color: star <= rating ? '#ffc107' : '#ddd',
              cursor: isInteractive ? 'pointer' : 'default',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            onClick={() => isInteractive && onRatingChange && onRatingChange(star)}
            disabled={!isInteractive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const filteredFeedbacks = feedbacks
    .filter(feedback => {
      const matchesSearch =
        feedback.text.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
        feedback.name.toLowerCase().includes(feedbackSearch.toLowerCase());
      const matchesFilter =
        feedbackFilter === 'All' || feedback.rating.toString() === feedbackFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (feedbackSort === 'Oldest') return new Date(a.timestamp) - new Date(b.timestamp);
      if (feedbackSort === 'Highest Rated') return b.rating - a.rating;
      if (feedbackSort === 'Lowest Rated') return a.rating - b.rating;
      return new Date(b.timestamp) - new Date(a.timestamp); // Newest
    });

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
              <a href={mockEvent.link} target="_blank" rel="noopener noreferrer nofollow">
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
          {/* Calendar Header with Navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <button
              onClick={handlePrevMonth}
              style={{
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              &#8249;
            </button>
            <div style={{ fontWeight: 500 }}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={handleNextMonth}
              style={{
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              &#8250;
            </button>
          </div>

          {/* Calendar Grid */}
          <table style={{ width: '100%', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ color: '#888' }}>
                <th style={{ padding: '4px', textAlign: 'center' }}>S</th>
                <th style={{ padding: '4px', textAlign: 'center' }}>M</th>
                <th style={{ padding: '4px', textAlign: 'center' }}>T</th>
                <th style={{ padding: '4px', textAlign: 'center' }}>W</th>
                <th style={{ padding: '4px', textAlign: 'center' }}>T</th>
                <th style={{ padding: '4px', textAlign: 'center' }}>F</th>
                <th style={{ padding: '4px', textAlign: 'center' }}>S</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const days = generateCalendarDays();
                const weeks = [];
                for (let i = 0; i < days.length; i += 7) {
                  weeks.push(days.slice(i, i + 7));
                }
                return weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((date, dayIndex) => (
                      <td key={dayIndex}>
                        {date ? (
                          <button
                            type="button"
                            onClick={() => handleDateClick(date)}
                            style={{
                              cursor: 'pointer',
                              padding: '6px',
                              textAlign: 'center',
                              border: 'none',
                              background: 'none',
                              width: '100%',
                              backgroundColor: isSameDate(selectedDate, date)
                                ? '#1976d2'
                                : isEventDate(date)
                                ? '#4caf50'
                                : 'transparent',
                              color:
                                isSameDate(selectedDate, date) || isEventDate(date)
                                  ? 'white'
                                  : 'inherit',
                              borderRadius: '4px',
                              position: 'relative',
                              fontWeight: isEventDate(date) ? 'bold' : 'normal',
                            }}
                            title={isEventDate(date) ? 'Event Date' : ''}
                          >
                            {date.getDate()}
                            {isEventDate(date) && !isSameDate(selectedDate, date) && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '2px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  width: '4px',
                                  height: '4px',
                                  backgroundColor: 'white',
                                  borderRadius: '50%',
                                }}
                              ></div>
                            )}
                          </button>
                        ) : (
                          <div style={{ padding: '6px' }}></div>
                        )}
                      </td>
                    ))}
                  </tr>
                ));
              })()}
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
                  Comment <span style={{ color: '#888', fontWeight: 400 }}>{comments.length}</span>
                </span>
                <button className={styles.sortBtn}>
                  <span style={{ fontSize: '1.1em' }}>⇅</span> Sort
                </button>
              </div>
              <div className={styles.commentBox}>
                <img src="/pfp-default.png" alt="profile" className={styles.commentProfilePic} />
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
                      <span className={styles.commentTimestamp}>
                        {comment.fixedTimestamp || getRelativeTime(comment.createdAt)}
                      </span>
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
                      <button
                        className={styles.replyBtn}
                        onClick={() => handleReplyClick(comment.id)}
                      >
                        <span style={{ fontSize: '1.1em' }}>💬</span>
                        <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>Reply</span>
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className={styles.replyFormContainer}>
                        <div className={styles.replyFormInner}>
                          <img
                            src="/pfp-default.png"
                            alt="profile"
                            className={styles.replyProfilePic}
                          />
                          <textarea
                            className={styles.replyTextarea}
                            placeholder={`Reply to ${comment.name}...`}
                            value={replyInput}
                            onChange={e => setReplyInput(e.target.value)}
                          />
                          <button
                            className={styles.replySubmitBtn}
                            onClick={() => handlePostReply(comment.id)}
                          >
                            Reply
                          </button>
                          <button
                            className={styles.replyCancelBtn}
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Display Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className={styles.repliesContainer}>
                        {comment.replies.map(reply => (
                          <div key={reply.id} className={styles.replyCard}>
                            <div className={styles.replyCardHeader}>
                              <img
                                src={reply.profilePic}
                                alt="profile"
                                className={styles.replyCardProfilePic}
                              />
                              <span className={styles.replyCardName}>{reply.name}</span>
                              <span className={styles.replyCardTimestamp}>
                                {reply.fixedTimestamp || getRelativeTime(reply.createdAt)}
                              </span>
                            </div>
                            <div className={styles.replyCardText}>{reply.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {hasMoreComments && (
                <button
                  className={styles.loadMoreBtn}
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </button>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {commentTab === 'Feedback' && (
            <div>
              {/* Feedback Stats */}
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
                    {(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(
                      1,
                    )}
                  </div>
                  <div style={{ color: '#666' }}>
                    {renderStars(
                      Math.round(
                        feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length,
                      ),
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Based on {feedbacks.length} reviews
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '8px' }}>
                    Feedback: {filteredFeedbacks.length}
                  </div>
                </div>
              </div>

              {/* Feedback Form */}
              <div className={styles.commentBox} style={{ marginBottom: '20px' }}>
                <img src="/pfp-default.png" alt="profile" className={styles.commentProfilePic} />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>
                      Rating *
                    </div>
                    {renderStars(feedbackRating, true, setFeedbackRating)}
                  </div>
                  <textarea
                    className={styles.commentInput}
                    rows={3}
                    placeholder="Share your feedback about this event..."
                    value={feedbackInput}
                    onChange={e => setFeedbackInput(e.target.value)}
                  />
                </div>
                <button className={styles.postBtn} onClick={handlePostFeedback} type="button">
                  Post Feedback
                </button>
              </div>

              {/* Search and Filter Controls */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '20px',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={feedbackSearch}
                  onChange={e => setFeedbackSearch(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                  }}
                />
                <select
                  value={feedbackSort}
                  onChange={e => setFeedbackSort(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Highest Rated">Highest Rated</option>
                  <option value="Lowest Rated">Lowest Rated</option>
                </select>
                <select
                  value={feedbackFilter}
                  onChange={e => setFeedbackFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="All">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              {/* Feedback List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map(feedback => (
                    <div key={feedback.id} className={styles.commentItem}>
                      <div className={styles.commentTopRow}>
                        <img
                          src={feedback.profilePic}
                          alt="profile"
                          className={styles.commentProfilePic}
                        />
                        <span className={styles.commentName}>{feedback.name}</span>
                        <span className={styles.commentTimestamp}>
                          {feedback.fixedTimestamp || feedback.timestamp}
                        </span>
                        <div
                          style={{
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          {renderStars(feedback.rating)}
                          <span style={{ fontSize: '0.9rem', color: '#666' }}>
                            ({feedback.rating}/5)
                          </span>
                        </div>
                      </div>
                      <div className={styles.commentText}>{feedback.text}</div>
                      <div className={styles.commentActionsRow}>
                        <button
                          className={styles.upvoteBtn}
                          title="Helpful"
                          onClick={() => handleHelpfulClick(feedback.id)}
                        >
                          <span style={{ fontSize: '1.1em' }}>👍</span>
                          <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>
                            {feedback.helpful}
                          </span>
                        </button>
                        <button
                          className={styles.replyBtn}
                          title="Report"
                          onClick={() => handleFlagClick(feedback.id)}
                        >
                          <span style={{ fontSize: '1.1em' }}>🚩</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <h3>No feedback found</h3>
                    <p>
                      {feedbackSearch || feedbackFilter !== 'All'
                        ? 'Try adjusting your search or filters.'
                        : 'Be the first to share your feedback!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ActivityComments;
