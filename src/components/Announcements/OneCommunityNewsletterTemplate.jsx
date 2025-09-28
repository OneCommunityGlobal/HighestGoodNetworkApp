import React from 'react';

function OneCommunityNewsletterTemplate({ templateData = {}, darkMode = false }) {
  const {
    updateNumber = '',
    newsletterTitle = `One Community Weekly Progress Update #${updateNumber}`,
    headerImageUrl = 'https://mcusercontent.com/1b1ba36facf96dc45b6697f82/images/931ce505-118d-19f7-c9ea-81d8e5e59613.png',
    thankYouMessage = 'Thank you for following One Community&apos;s progress, here is the link to our weekly progress report #651 with our update video and recent progress related imagery, links, and other details: https://onecommunityglobal.org/open-source-utopia-models',
    videoTopicTitle = '',
    videoUrl = 'https://youtu.be/QzbNEQ9fREw',
    videoThumbnailUrl = 'https://img.youtube.com/vi/QzbNEQ9fREw/maxresdefault.jpg',
    missionMessage = '',
    videoLinkText = 'Click here for the video on this topic: https://youtu.be/QzbNEQ9fREw',
    donationMessage = 'Love what we&apos;re doing and want to help? Click <a href="https://onecommunityglobal.org/contribute-join-partner/" target="_blank" rel="noopener noreferrer">here</a> to learn what we&apos;re currently raising money for and to donate. Even $5 dollars helps!',
    footerQuote = 'In order to change an existing paradigm you do not struggle to try and change the problematic model. You create a new model and make the old one obsolete. That, in essence, is the higher service to which we are all being called.',
    footerAuthor = 'Buckminster Fuller',
    mailingAddress = 'One Community Inc.\n8954 Camino Real\nSan Gabriel, CA 91775-1932',
    updatePreferencesText = 'Want to change how you receive these emails?\nYou can update your preferences or unsubscribe from this list.',
    socialLinks = [
      {
        name: 'Website',
        url: 'https://www.onecommunityglobal.org/overview/',
        icon:
          'https://www.dropbox.com/scl/fi/d8qldlgs3m0fmhwynzguh/link.png?rlkey=apqucrte9pwplhvjakyfbiw1j&st=dis5ps7b&raw=1',
      },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/onecommunityfans',
        icon:
          'https://www.dropbox.com/scl/fi/kigo13prmkypd9rsttvan/facebook.png?rlkey=q4r4uz6hn6bp75u48db7gju49&st=zzebhh1k&raw=1',
      },
      {
        name: 'X (Twitter)',
        url: 'https://x.com/onecommunityorg',
        icon:
          'https://www.dropbox.com/scl/fi/l2wbgkc6u0taaeguvsu5c/x.png?rlkey=btzsctxjlarmfsjakk5pfhvqu&st=0rfg3xcd&raw=1',
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/company/one-community-global/posts/?feedView=all',
        icon:
          'https://www.dropbox.com/scl/fi/u17ghmc38dcln4avgcvuc/linkedin.png?rlkey=v8qimmq5h648fbsnhay8kan9t&st=fm0uvrhw&raw=1',
      },
      {
        name: 'YouTube',
        url: 'https://www.youtube.com/user/onecommunityorg',
        icon:
          'https://www.dropbox.com/scl/fi/88byqgoytpez4k937syou/youtube.png?rlkey=yhwkwmrpsn0eaz5yuu9h5ysce&st=jq80ocek&raw=1',
      },
      {
        name: 'Instagram',
        url: 'https://www.instagram.com/onecommunityglobal/',
        icon:
          'https://www.dropbox.com/scl/fi/wvsr28y19ro0icv4tr5mc/ins.png?rlkey=v4fbrmoniil8jcwtiv8ew7o7s&st=04vwah63&raw=1',
      },
      {
        name: 'Pinterest',
        url: 'https://www.pinterest.com/onecommunityorg/one-community/',
        icon:
          'https://www.dropbox.com/scl/fi/88byqgoytpez4k937syou/youtube.png?rlkey=yhwkwmrpsn0eaz5yuu9h5ysce&st=jq80ocek&raw=1',
      },
      {
        name: 'Email',
        url: 'mailto:onecommunitupdates@gmail.com',
        icon:
          'https://www.dropbox.com/scl/fi/7bahc1w6h6cyez8610nwi/guirong.wu.10-gmail.com.png?rlkey=1tokcqsp6dix4xjr44zytmlbl&st=qa5hly4e&raw=1',
      },
    ],
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
    fontSize: '14px',
    lineHeight: '1.6',
    color: darkMode ? '#ffffff' : '#333333',
    marginBottom: '15px',
  };

  const videoSectionStyle = {
    marginTop: '25px',
    marginBottom: '25px',
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
    padding: '20px 0',
    borderTop: '1px solid #e0e0e0',
    marginTop: '30px',
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

  const socialIcons = [
    {
      href: 'https://www.onecommunityglobal.org/overview/',
      src:
        'https://www.dropbox.com/scl/fi/d8qldlgs3m0fmhwynzguh/link.png?rlkey=apqucrte9pwplhvjakyfbiw1j&st=dis5ps7b&raw=1',
      alt: 'One Community Overview',
    },
    {
      href: 'https://www.facebook.com/onecommunityfans',
      src:
        'https://www.dropbox.com/scl/fi/kigo13prmkypd9rsttvan/facebook.png?rlkey=q4r4uz6hn6bp75u48db7gju49&st=zzebhh1k&raw=1',
      alt: 'Facebook',
    },
    {
      href: 'https://x.com/onecommunityorg',
      src:
        'https://www.dropbox.com/scl/fi/l2wbgkc6u0taaeguvsu5c/x.png?rlkey=btzsctxjlarmfsjakk5pfhvqu&st=0rfg3xcd&raw=1',
      alt: 'X',
    },
    {
      href: 'https://www.linkedin.com/company/one-community-global/posts/?feedView=all',
      src:
        'https://www.dropbox.com/scl/fi/u17ghmc38dcln4avgcvuc/linkedin.png?rlkey=v8qimmq5h648fbsnhay8kan9t&st=fm0uvrhw&raw=1',
      alt: 'LinkedIn',
    },
    {
      href: 'https://www.youtube.com/user/onecommunityorg',
      src:
        'https://www.dropbox.com/scl/fi/88byqgoytpez4k937syou/youtube.png?rlkey=yhwkwmrpsn0eaz5yuu9h5ysce&st=jq80ocek&raw=1',
      alt: 'YouTube',
    },
    {
      href: 'https://www.instagram.com/onecommunityglobal/',
      src:
        'https://www.dropbox.com/scl/fi/wvsr28y19ro0icv4tr5mc/ins.png?rlkey=v4fbrmoniil8jcwtiv8ew7o7s&st=04vwah63&raw=1',
      alt: 'Instagram',
    },
    {
      href: 'https://www.pinterest.com/onecommunityorg/one-community/',
      src:
        'https://www.dropbox.com/scl/fi/88byqgoytpez4k937syou/youtube.png?rlkey=yhwkwmrpsn0eaz5yuu9h5ysce&st=jq80ocek&raw=1',
      alt: 'Pinterest',
    },
    {
      href: 'mailto:onecommunitupdates@gmail.com',
      src:
        'https://www.dropbox.com/scl/fi/7bahc1w6h6cyez8610nwi/guirong.wu.10-gmail.com.png?rlkey=1tokcqsp6dix4xjr44zytmlbl&st=qa5hly4e&raw=1',
      alt: 'Email',
    },
  ];

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
                style={descriptionStyle}
                dangerouslySetInnerHTML={{
                  __html: thankYouMessage
                    .replace(/<p[^>]*>/g, '')
                    .replace(/<\/p>/g, ' ')
                    .replace(/<br\s*\/?>/g, ' ')
                    .trim(),
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
                    style={descriptionStyle}
                    dangerouslySetInnerHTML={{
                      __html: `"${missionMessage
                        .replace(/<p[^>]*>/g, '')
                        .replace(/<\/p>/g, ' ')
                        .replace(/<br\s*\/?>/g, ' ')
                        .trim()}"`,
                    }}
                  />
                )}

                {/* Video Link */}
                <p style={descriptionStyle}>{videoLinkText.replace(/<[^>]*>/g, '')}</p>
              </div>

              {/* Donation Message */}
              <div
                style={descriptionStyle}
                dangerouslySetInnerHTML={{
                  __html: donationMessage
                    .replace(/<p[^>]*>/g, '')
                    .replace(/<\/p>/g, ' ')
                    .replace(/<br\s*\/?>/g, ' ')
                    .trim(),
                }}
              />

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

              {/* Footer Quote */}
              <div style={footerStyle}>
                <p
                  dangerouslySetInnerHTML={{
                    __html: `"${footerQuote
                      .replace(/<p[^>]*>/g, '')
                      .replace(/<\/p>/g, ' ')
                      .replace(/<br\s*\/?>/g, ' ')
                      .trim()}"<br />~ ${footerAuthor} ~`,
                  }}
                />
              </div>

              {/* Mailing Address */}
              <div style={footerStyle}>
                <p>
                  {mailingAddress.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < mailingAddress.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>

                <p>
                  {updatePreferencesText.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < updatePreferencesText.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default OneCommunityNewsletterTemplate;
