import React from 'react';

function OneCommunityNewsletterTemplate({ templateData = {}, darkMode = false }) {
  const {
    updateNumber,
    newsletterTitle,
    headerImageUrl,
    thankYouMessage,
    videoUrl,
    videoThumbnailUrl,
    missionMessage,
    videoLinkText,
    donationMessage,
    footerContent,
    socialLinks,
  } = templateData;
  const mainTableStyle = {
    width: '100%',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '14px',
    backgroundColor: darkMode ? '#1a2233' : '#ffffff',
    color: darkMode ? '#ffffff' : '#333333',
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: darkMode ? '#232b3e' : '#ffffff',
    padding: '20px',
  };

  const headerImageStyle = {
    width: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: darkMode ? '#ffffff' : '#333333',
    marginTop: '20px',
    marginBottom: '15px',
    lineHeight: '1.3',
  };

  const descriptionStyle = {
    fontSize: '12pt',
    lineHeight: '1.5',
    color: darkMode ? '#ffffff' : '#333333',
    marginBottom: '20px',
  };

  const videoSectionStyle = {
    marginTop: '20px',
    marginBottom: '30px',
  };

  const videoImageStyle = {
    width: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto 25px auto',
    borderRadius: '8px',
  };

  const footerStyle = {
    fontSize: '12px',
    color: darkMode ? '#cccccc' : '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
  };

  const socialLinksStyle = {
    textAlign: 'center',
    padding: '10px 0',
    marginTop: '5px',
  };

  return (
    <div style={mainTableStyle}>
      <div style={containerStyle}>
        {/* Header Image */}
        {headerImageUrl && headerImageUrl.trim() !== '' && (
          <img src={headerImageUrl} alt="One Community Header" style={headerImageStyle} />
        )}

        {/* Title */}
        <h1 style={titleStyle}>{newsletterTitle}</h1>

        {/* Thank You Message */}
        <div
          dangerouslySetInnerHTML={{
            __html: thankYouMessage.replace(
              /color: #333333/g,
              `color: ${darkMode ? '#ffffff' : '#333333'}`,
            ),
          }}
        />

        {/* This Week's Video Topic Section */}
        <div style={videoSectionStyle}>
          <p style={descriptionStyle}>This Week&apos;s Video Topic:</p>
          <div>
            {videoThumbnailUrl && videoThumbnailUrl.trim() !== '' && (
              <img src={videoThumbnailUrl} alt="Video Topic Thumbnail" style={videoImageStyle} />
            )}

            {/* Mission Message */}
            {missionMessage && (
              <div
                dangerouslySetInnerHTML={{
                  __html: missionMessage.replace(
                    /color: #333333/g,
                    `color: ${darkMode ? '#ffffff' : '#333333'}`,
                  ),
                }}
              />
            )}

            {/* Video Link */}
            <div
              dangerouslySetInnerHTML={{
                __html: videoLinkText.replace(
                  /color: #333333/g,
                  `color: ${darkMode ? '#ffffff' : '#333333'}`,
                ),
              }}
            />
          </div>
        </div>

        {/* Donation Message */}
        <div
          dangerouslySetInnerHTML={{
            __html: donationMessage.replace(
              /color: #333333/g,
              `color: ${darkMode ? '#ffffff' : '#333333'}`,
            ),
          }}
        />

        {/* Footer Section */}
        <div
          style={{
            backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5',
            padding: '20px 0',
            marginTop: '30px',
            marginLeft: '-20px',
            marginRight: '-20px',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
        >
          {/* Social Links */}
          <div style={socialLinksStyle}>
            {socialLinks &&
              socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  style={{
                    display: 'inline-block',
                    margin: '0 10px',
                    textDecoration: 'none',
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={social.icon}
                    alt={social.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      margin: '0 6px',
                      verticalAlign: 'middle',
                    }}
                  />
                </a>
              ))}
          </div>

          {/* Horizontal Line */}
          <hr
            style={{
              border: 'none',
              borderTop: `1px solid ${darkMode ? '#444444' : '#cccccc'}`,
              margin: '15px 0 30px 0',
              width: '100%',
            }}
          />

          {/* Footer Content */}
          <div>
            <div
              dangerouslySetInnerHTML={{
                __html: footerContent.replace(
                  /style="text-align: center;"/g,
                  `style="text-align: center; color: ${darkMode ? '#ffffff' : '#000000'};"`,
                ),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OneCommunityNewsletterTemplate;
