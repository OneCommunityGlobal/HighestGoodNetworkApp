function WeeklyEmailTemplate() {
  const cardStyle = {
    background: '#fff',
    maxWidth: 600,
    margin: '40px auto 0 auto',
    padding: 18,
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  };

  const iconStyle = {
    verticalAlign: 'middle',
    width: 36,
    height: 36,
    margin: '0 8px',
  };

  const dividerStyle = {
    border: 0,
    borderTop: '1px solid #e0e0e0',
    margin: '32px auto 0 auto',
    width: '100%',
    maxWidth: 600,
  };

  const socialIcons = [
    {
      href: 'https://onecommunityglobal.org/overview/',
      src: '/announcements-images/link.png',
      alt: 'Website',
    },
    {
      href: 'https://www.facebook.com/onecommunityfans',
      src: '/announcements-images/facebook.png',
      alt: 'Facebook',
    },
    {
      href: 'https://x.com/onecommunityorg',
      src: '/announcements-images/x.png',
      alt: 'X',
    },
    {
      href: 'https://www.linkedin.com/company/one-community-global/posts/?feedView=all',
      src: '/announcements-images/linkedin.png',
      alt: 'LinkedIn',
    },
    {
      href: 'https://www.youtube.com/user/onecommunityorg',
      src: '/announcements-images/youtube.png',
      alt: 'YouTube',
    },
    {
      href: 'https://www.instagram.com/onecommunityglobal/',
      src: '/announcements-images/instagram.png',
      alt: 'Instagram',
    },
    {
      href: 'https://www.pinterest.com/onecommunityorg/one-community/',
      src: '/announcements-images/pinterest.png',
      alt: 'Pinterest',
    },
    {
      href: 'mailto:onecommunitupdates@gmail.com',
      src: '/announcements-images/email.png',
      alt: 'Email',
    },
  ];

  return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', width: '100%' }}>
      <div style={cardStyle}>
        <img
          src="/announcements-images/header.png"
          alt="Header"
          style={{ width: '100%', maxWidth: '100%', height: 'auto' }}
        />
        <h2 style={{ marginTop: 24 }}>One Community Weekly Progress Update #638</h2>
        <p>
          Thank you for following One Community&apos;s progress, here is the link to our weekly
          progress report #638 with our update video and recent progress related imagery, links, and
          other details:
          <br />
          <a href="https://onecommunityglobal.org/establishing-abundant-community-systems">
            https://onecommunityglobal.org/establishing-abundant-community-systems
          </a>
        </p>
        <p>
          Also, please support the petition below to switch the US to the Metric System! Signing and
          sharing is greatly appreciated.
          <br />
          <a href="https://www.change.org/p/metric-efficiency-tell-doge-it-s-time-the-us-switches">
            https://www.change.org/p/metric-efficiency-tell-doge-it-s-time-the-us-switches
          </a>
        </p>
        <h3>This Week&apos;s Video Topic:</h3>
        <img
          src="/announcements-images/topic.png"
          alt="Video Topic"
          style={{ width: '100%', maxWidth: '100%', height: 'auto' }}
        />
        <p>
          &quot;At One Community, we are establishing abundant community systems to regenerate our
          planet and create positive change. Our all-volunteer team is focused on sustainable
          approaches to food, energy, housing, education, economics, and social architecture. By
          open sourcing and freely sharing the complete process, we aim to build a self-replicating
          model that inspires a global collaboration of teacher/demonstration hubs, all for
          &apos;The Highest Good of All.&apos; Together, we are evolving sustainability and
          fostering global stewardship practices that promote fulfilled living and lasting
          impact.&quot;
        </p>
        <p>
          Click here for the video on this topic:{' '}
          <a href="https://youtu.be/UurlmcfLfOg">https://youtu.be/UurlmcfLfOg</a>
        </p>
        <p>
          Love what we&apos;re doing and want to help? Click{' '}
          <a href="https://onecommunityglobal.org/donate/">here</a> to learn what we&apos;re
          currently raising money for and to donate. Even $5 dollars helps!
        </p>
      </div>
      <div
        style={{
          background: '#FAFAFA',
          maxWidth: 600,
          margin: '0 auto 40px auto',
          borderRadius: 8,
          padding: '32px 0 24px 0',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
          {socialIcons.map(icon => (
            <a key={icon.href} href={icon.href} style={{ display: 'inline-block' }}>
              <img src={icon.src} alt={icon.alt} style={iconStyle} />
            </a>
          ))}
        </div>
        <hr style={dividerStyle} />
        <div
          style={{
            color: '#888',
            fontSize: 14,
            textAlign: 'center',
            margin: '32px auto 0 auto',
            maxWidth: 600,
          }}
        >
          <p style={{ fontStyle: 'italic', marginBottom: 16 }}>
            &quot;In order to change an existing paradigm you do not struggle to try and change the
            problematic model. You create a new model and make the old one obsolete. That, in
            essence, is the higher service to which we are all being called.&quot;
            <br />~ Buckminster Fuller ~
          </p>
          <p style={{ marginBottom: 16 }}>
            <strong>Our mailing address is:</strong>
            <br />
            One Community Inc.
            <br />
            8954 Camino Real
            <br />
            San Gabriel, CA 91775-1932
          </p>
          <p style={{ marginBottom: 8 }}>Add us to your address book</p>
          <p style={{ marginBottom: 0 }}>
            Want to change how you receive these emails?
            <br />
            You can{' '}
            <button
              type="button"
              style={{
                color: '#888',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                font: 'inherit',
              }}
              onClick={e => e.preventDefault()}
            >
              update your preferences
            </button>{' '}
            or{' '}
            <button
              type="button"
              style={{
                color: '#888',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                font: 'inherit',
              }}
              onClick={e => e.preventDefault()}
            >
              unsubscribe from this list
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeeklyEmailTemplate;
