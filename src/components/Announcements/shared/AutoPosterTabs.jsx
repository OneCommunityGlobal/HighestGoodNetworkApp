import React from 'react';
import classNames from 'classnames';

const AutoPosterTabs = ({ activeTab, setActiveTab, tabs, styles }) => (
  <div className={styles.subtabs}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        type="button"
        className={classNames(styles.subtab, {
          [styles.active]: activeTab === tab.id,
        })}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default AutoPosterTabs;
