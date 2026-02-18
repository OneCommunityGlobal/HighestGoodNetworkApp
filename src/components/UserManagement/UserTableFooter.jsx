import React from 'react';
import styles from './usermanagement.module.css';

const NUMBER_OF_PAGE_LINK = 5;

const UserTableFooterComponent = (props) => {
  const { darkMode } = props;
  const onSelectPageSize = pageSize => {
    props.onSelectPageSize(parseInt(pageSize, 10));
  };

  const onPageSelect = page => {
    props.onPageSelect(page);
  };

  return (
    <div id="usermanagement-footer" className="row">
      <PageSummaryLabel
        selectedPage={props.selectedPage}
        pageSize={props.pageSize}
        datacount={props.datacount}
      />
      <PageSizeDropDown onSelectPageSize={onSelectPageSize}  darkMode={darkMode}/>
      <div id="ember745" className="table-nav col-md-6 col-sm-6 col-xs-6 ember-view">
        <div role="toolbar" className="btn-toolbar pull-right">
          <div role="group" className="btn-group">
            <button
              type="button"
              className={`btn btn-default ${darkMode ? 'text-light' : ''}`}
              onClick={() => {
                if (props.selectedPage > 1) {
                  props.onPageSelect(props.selectedPage - 1);
                }
              }}
            >
              Previous
            </button>
            <PageLinks
              selectedPage={props.selectedPage}
              pageSize={props.pageSize}
              datacount={props.datacount}
              onPageSelect={onPageSelect}
            />
            <button
              type="button"
              className={`btn btn-default ${darkMode ? 'text-light' : ''}`}
              onClick={() => {
                if (props.selectedPage <= parseInt(props.datacount / props.pageSize, 10)) {
                  props.onPageSelect(props.selectedPage + 1);
                }
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserTableFooter = React.memo(UserTableFooterComponent);
UserTableFooter.displayName = 'UserTableFooter';

/**
 * The page size dropdown stateless component
 */
const PageSizeDropDownComponent = (props) => {
  return (
    <div className="col-md-2 col-sm-2 col-xs-2">
      <div className="pull-right">
        <div id="ember738" className="ember-view">
          <select
            id="ember739"
            className={`changePageSize form-control ember-view ${props.darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
            onChange={e => {
              props.onSelectPageSize(parseInt(e.target.value, 10));
            }}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const PageSizeDropDown = React.memo(PageSizeDropDownComponent);
PageSizeDropDown.displayName = 'PageSizeDropDown';

/**
 * Stateless component to display the page summary labels.
 */
const PageSummaryLabelComponent = (props) => {
  const firstUserOfPage = (props.selectedPage - 1) * props.pageSize + 1;
  const totalUsersFind = props.datacount;
  const lastUserOfPage = props.selectedPage * props.pageSize;

  let displayedUsers;

  if (totalUsersFind < 10 || lastUserOfPage > totalUsersFind) {
    if (totalUsersFind === 0) {
      displayedUsers = `Showing 0 - ${totalUsersFind} of ${totalUsersFind}`;
    } else {
      displayedUsers = `Showing ${firstUserOfPage} - ${totalUsersFind} of ${totalUsersFind}`;
    }
  } else {
    displayedUsers = `Showing ${firstUserOfPage} - ${lastUserOfPage} of ${totalUsersFind}`;
  }

  return (
    <div
      id="user_table_footer"
      className="table-summary col-md-4 col-sm-4 col-xs-4 ember-view"
      style={{ marginBottom: '25px' }}
    >
      {displayedUsers}
    </div>
  );
};

const PageSummaryLabel = React.memo(PageSummaryLabelComponent);
PageSummaryLabel.displayName = 'PageSummaryLabel';

/**
 * Stateless component to display page links.
 */
const PageLinksComponent = (props) => {
  const onPageSelect = pageNo => {
    props.onPageSelect(pageNo);
    // change page on props
  };

  const pageLinks = [];
  const totalPages = parseInt(props.datacount / props.pageSize, 10) + 1;

  /* Start page will be 1 for the first time,  
   and it will change based on the selected page and total page so that we can show the lin for 5 . */
  let startPage;

  if (totalPages <= NUMBER_OF_PAGE_LINK) {
    startPage = 1; // When total pages are less than or equal to the number of page links
  } else if (totalPages - props.selectedPage < NUMBER_OF_PAGE_LINK) {
    startPage = totalPages - (NUMBER_OF_PAGE_LINK - 1); // When the remaining pages are less than the number of page links
  } else {
    startPage = props.selectedPage; // Default case
  }

  let pageCounter = startPage;

  while (
    pageCounter <
    startPage + (totalPages < NUMBER_OF_PAGE_LINK ? totalPages : NUMBER_OF_PAGE_LINK)
  ) {
    pageLinks.push(
      <PageLinkItem
        pageNo={pageCounter}
        onPageSelect={onPageSelect}
        key={`page-link-${pageCounter}`}
        isSelected={props.selectedPage === pageCounter}
      />,
    );

    pageCounter += 1;
  }
  return pageLinks;
};

const PageLinks = React.memo(PageLinksComponent);
PageLinks.displayName = 'PageLinks';

/**
 * Single page lin item
 */
const PageLinkItemComponent = (props) => {
  return (
    <button
      type="button"
      style={{ fontWeight: props.isSelected ? 'bold' : 'normal' }}
      className={`${styles.pageNoLink} ${styles.linkButton}`}
      onClick={e => {
        e.preventDefault();
        props.onPageSelect(props.pageNo);
      }}
      key={`page-${props.pageNo}`}
    >
      {props.pageNo}
    </button>
  );
};

const PageLinkItem = React.memo(PageLinkItemComponent);
PageLinkItem.displayName = 'PageLinkItem';

export default UserTableFooter;
