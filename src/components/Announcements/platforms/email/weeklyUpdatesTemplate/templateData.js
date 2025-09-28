// Default template data for One Community Newsletter Template
// This file contains all the default values and configuration for the email template

// Helper function to get the base URL for subscription links
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for server-side rendering or when window is not available
  return 'https://highestgoodnetwork.org';
};

export const defaultTemplateData = {
  updateNumber: '',
  subject: 'One Community Weekly Progress Update',
  headerImageUrl:
    'https://mcusercontent.com/1b1ba36facf96dc45b6697f82/images/931ce505-118d-19f7-c9ea-81d8e5e59613.png',
  thankYouMessage:
    '<p style="font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; margin: 0 0 16px 0; color: #333333;">Thank you for following One Community\'s progress, here is the link to our weekly progress report with our update video and recent progress related imagery, links, and other details: </p>',
  videoTopicTitle: '',
  videoUrl: '',
  videoThumbnailUrl: '',
  missionMessage:
    '<p style="font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; margin: 0 0 16px 0; color: #333333;"></p>',
  videoLinkText: '',
  donationMessage:
    '<p style="font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; margin: 0 0 16px 0; color: #333333;">Love what we\'re doing and want to help? Click <a href="https://onecommunityglobal.org/contribute-join-partner/" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">here</a> to learn what we\'re currently raising money for and to donate. Even $5 dollars helps!</p>',
  footerContent:
    '<p style="text-align: center;"><em>In order to change an existing paradigm you do not struggle to try and change the problematic model. You create a new model and make the old one obsolete. That, in essence, is the higher service to which we are all being called.<br /><br />~ Buckminster Fuller ~</em></p><p style="text-align: center;"><strong style="color: inherit;">Our Mailing Address is:</strong><br />One Community Inc.<br />8954 Camino Real<br />San Gabriel, CA 91775-1932</p><p style="text-align: center;">Want to stop receiving these emails?<br /><a href="' +
    getBaseUrl() +
    '/unsubscribe" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">Unsubscribe</a> from this list.</p>',
  socialLinks: [
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
};

// Default reset values for various sections
export const defaultResetValues = {
  subject: 'One Community Weekly Progress Update',
  thankYouMessage:
    '<p style="font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; margin: 0 0 16px 0; color: #333333;">Thank you for following One Community\'s progress, here is the link to our weekly progress report with our update video and recent progress related imagery, links, and other details: <a href="https://onecommunityglobal.org/open-source-utopia-models" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">https://onecommunityglobal.org/open-source-utopia-models</a></p>',
  missionMessage:
    '<p style="font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; margin: 0 0 16px 0; color: #333333;"></p>',
  videoLinkText: '',
  donationMessage:
    '<p style="font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; margin: 0 0 16px 0; color: #333333;">Love what we\'re doing and want to help? Click <a href="https://onecommunityglobal.org/contribute-join-partner/" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">here</a> to learn what we\'re currently raising money for and to donate. Even $5 dollars helps!</p>',
  footerContent:
    '<p style="text-align: center;"><em>In order to change an existing paradigm you do not struggle to try and change the problematic model. You create a new model and make the old one obsolete. That, in essence, is the higher service to which we are all being called.<br /><br />~ Buckminster Fuller ~</em></p><p style="text-align: center;"><strong style="color: inherit;">Our Mailing Address is:</strong><br />One Community Inc.<br />8954 Camino Real<br />San Gabriel, CA 91775-1932</p><p style="text-align: center;">Want to stop receiving these emails?<br /><a href="' +
    getBaseUrl() +
    '/unsubscribe" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">Unsubscribe</a> from this list.</p>',
  socialLinks: [
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
};

// Helper function to get default template data with newsletter title
export const getTemplateDataWithDefaults = templateData => {
  return {
    ...defaultTemplateData,
    ...templateData,
    updateNumber: templateData.updateNumber || '',
    newsletterTitle: `One Community Weekly Progress Update #${templateData.updateNumber || ''}`,
  };
};
