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
    borderCollapse: 'collapse',
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
    marginBottom: '20px',
  };

  const videoTitleStyle = {
    fontSize: '16px',
    fontWeight: 'normal',
    color: darkMode ? '#ffffff' : '#333333',
    marginBottom: '15px',
  };

  const videoImageStyle = {
    width: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto 15px auto',
    textAlign: 'center',
  };

  const linkStyle = {
    color: '#0066cc',
    textDecoration: 'underline',
  };

  const socialLinksStyle = {
    textAlign: 'center',
    padding: '10px 0',
    marginTop: '5px',
  };

  const socialLinkStyle = {
    display: 'inline-block',
    margin: '0 10px',
    textDecoration: 'none',
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

  return (
    <table style={mainTableStyle}>
      <tbody>
        <tr>
          <td>
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

              {/* Video Section */}
              <div style={videoSectionStyle}>
                <p style={videoTitleStyle}>This Week&apos;s Video Topic:</p>

                {/* Video Thumbnail/Link */}
                {videoThumbnailUrl &&
                  videoThumbnailUrl.trim() !== '' &&
                  videoUrl &&
                  videoUrl.trim() !== '' && (
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={videoThumbnailUrl}
                        alt="Video Topic Thumbnail"
                        style={videoImageStyle}
                      />
                    </a>
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

              {/* Donation Message */}
              <div
                dangerouslySetInnerHTML={{
                  __html: donationMessage.replace(
                    /color: #333333/g,
                    `color: ${darkMode ? '#ffffff' : '#333333'}`,
                  ),
                }}
              />

              {/* Footer Section with Light Grey Background */}
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
                {/* Social Media Links */}
                <div style={socialLinksStyle}>
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      style={socialLinkStyle}
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
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default OneCommunityNewsletterTemplate;
