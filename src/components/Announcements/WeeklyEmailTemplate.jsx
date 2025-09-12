import React from 'react';

function WeeklyEmailTemplate({ headerImageUrl, videoTopicImageUrl, darkMode }) {
  const containerStyle = {
    maxWidth: '900px',
    width: '100%',
    margin: 'auto',
    backgroundColor: darkMode ? '#14233a' : '#ffffff',
    color: darkMode ? '#ffffff' : '#000000',
    fontFamily: 'Arial, Helvetica, sans-serif',
    lineHeight: 1.5,
  };

  const headerImageStyle = {
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
    display: headerImageUrl ? 'block' : 'none',
  };

  const topicImageStyle = {
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
    display: videoTopicImageUrl ? 'block' : 'none',
    marginTop: '12px',
  };

  return (
    <div style={containerStyle}>
      {headerImageUrl ? <img src={headerImageUrl} alt="Header" style={headerImageStyle} /> : null}
      {videoTopicImageUrl ? (
        <img src={videoTopicImageUrl} alt="Video Topic" style={topicImageStyle} />
      ) : null}
      <div style={{ padding: '16px' }}>
        <h2 style={{ marginTop: 0 }}>Weekly Update</h2>
        <p>This is a placeholder weekly email template.</p>
      </div>
    </div>
  );
}

export default WeeklyEmailTemplate;
