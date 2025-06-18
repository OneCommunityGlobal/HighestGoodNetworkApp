function WeeklyEmailTemplate({ headerImageUrl, videoTopicImageUrl, darkMode }) {
  const cardStyle = {
    background: darkMode ? '#232b3e' : '#fff',
    color: darkMode ? '#fff' : '#333',
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
      src:
        'https://www.dropbox.com/scl/fi/d8qldlgs3m0fmhwynzguh/link.png?rlkey=apqucrte9pwplhvjakyfbiw1j&st=dis5ps7b&raw=1',
      alt: 'Website',
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

  const dropboxImg =
    headerImageUrl ||
    'https://www.dropbox.com/scl/fi/60pgjcylcw15uik0wmoxj/HD-Horizontal-Logo-1275x375.jpg?rlkey=34nu3c1pav1d16dkstu5jq8g8&raw=1';
  const videoImg =
    videoTopicImageUrl ||
    'https://www.dropbox.com/scl/fi/e4gv4jo2p128u2ezqva4j/topic.jpg?rlkey=10qsu8i15my3fa3bk34z4yjhq&raw=1';

  return (
    <div
      style={{
        background: darkMode ? '#1a2233' : '#FAFAFA',
        minHeight: '100vh',
        width: '100%',
        color: darkMode ? '#fff' : '#333',
      }}
    >
      <div style={cardStyle}>
        <img
          src={dropboxImg}
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
          src={videoImg}
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
          background: darkMode ? '#232b3e' : '#FAFAFA',
          color: darkMode ? '#fff' : '#333',
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
            color: darkMode ? '#bbb' : '#888',
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
