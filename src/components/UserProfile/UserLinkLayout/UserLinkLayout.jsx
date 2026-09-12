import React from 'react';
import UserLinks from '../UserLinks';
import LinkModButton from '../UserProfileEdit/LinkModButton';
import styles from '../UserLinks/UserLinks.module.css';

const UserLinkLayout = props => {
  const { userProfile, updateLink, handleLinkModel, handleSubmit, darkMode } = props;

  const { adminLinks, personalLinks } = userProfile;

  return (
    <div className={darkMode ? styles.linksSectionDark : ''} data-testid="user-link">
      <p
        className={darkMode ? styles.linksLabelDark : ''}
        style={{ display: 'inline-block', marginRight: 10 }}
      >
        LINKS{' '}
      </p>
      {props.canEdit ? (
        <LinkModButton
          userProfile={userProfile}
          updateLink={updateLink}
          role={props.role}
          handleSubmit={handleSubmit}
          className={`${styles.editLink} ${darkMode ? styles.editLinkDark : ''}`}
        />
      ) : null}
      <UserLinks
        linkSection="user"
        links={personalLinks}
        handleLinkModel={handleLinkModel}
        darkMode={darkMode}
      />
      <UserLinks
        linkSection="user"
        links={adminLinks}
        handleLinkModel={handleLinkModel}
        darkMode={darkMode}
      />
    </div>
  );
};

export default UserLinkLayout;
