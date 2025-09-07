import React from 'react';

const WeeklyEmailTemplate = ({ headerImageUrl, videoTopicImageUrl, darkMode }) => {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
      }}
    >
      {headerImageUrl && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={headerImageUrl}
            alt="Header"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: 'none',
            }}
          />
        </div>
      )}

      <div style={{ padding: '20px' }}>
        <h1
          style={{
            color: darkMode ? '#ffffff' : '#333333',
            fontSize: '24px',
            marginBottom: '20px',
          }}
        >
          Weekly Update
        </h1>

        <p
          style={{
            color: darkMode ? '#cccccc' : '#666666',
            lineHeight: '1.6',
            marginBottom: '20px',
          }}
        >
          This is your weekly update content. You can edit this section to add your weekly progress,
          announcements, and other important information.
        </p>

        {videoTopicImageUrl && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <img
              src={videoTopicImageUrl}
              alt="Video Topic"
              style={{
                maxWidth: '100%',
                height: 'auto',
                border: 'none',
              }}
            />
          </div>
        )}

        <div
          style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5',
            borderRadius: '5px',
          }}
        >
          <h3
            style={{
              color: darkMode ? '#ffffff' : '#333333',
              marginBottom: '10px',
            }}
          >
            Key Highlights
          </h3>
          <ul
            style={{
              color: darkMode ? '#cccccc' : '#666666',
              lineHeight: '1.6',
            }}
          >
            <li>Add your key highlights here</li>
            <li>Important updates and progress</li>
            <li>Upcoming events or deadlines</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: darkMode ? '#888888' : '#999999',
          }}
        >
          <p>Thank you for your continued support and participation.</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyEmailTemplate;
