import React from 'react';
const NUMBER_OF_PAGE_LINK = 5;

const UserTableFooter = React.memo(props => {
  const darkMode = props.darkMode;

  const onSelectPageSize = pageSize => {
    props.onSelectPageSize(parseInt(pageSize));
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
      <PageSizeDropDown onSelectPageSize={onSelectPageSize} />
      <div id="ember745" className="table-nav col-md-6 col-sm-6 col-xs-6 ember-view">
        <div role="toolbar" className="btn-toolbar pull-right">
          <div role="group" className="btn-group">
            <button
              type="button"
              className={`btn btn-default ${darkMode ? 'text-light' : ''}`}
              onClick={e => {
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
              onClick={e => {
                if (props.selectedPage <= parseInt(props.datacount / props.pageSize)) {
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
});

/**
 * The page size dropdown stateless component
 */
const PageSizeDropDown = React.memo(props => {
  return (
    <div className="col-md-2 col-sm-2 col-xs-2">
      <div className="pull-right">
        <div id="ember738" className="ember-view">
          <select
            id="ember739"
            className="changePageSize form-control ember-view"
            onChange={e => {
              props.onSelectPageSize(parseInt(e.target.value));
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  );
});

/**
 * Stateless component to display the page summary labels.
 */
const PageSummaryLabel = React.memo(props => {
  let firstUserOfPage = (props.selectedPage - 1) * props.pageSize + 1;
  let totalUsersFind = props.datacount;
  let lastUserOfPage = props.selectedPage * props.pageSize;

  const displayedUsers =
    totalUsersFind < 10 || lastUserOfPage > totalUsersFind
      ? totalUsersFind === 0
        ? `Showing 0 - ${totalUsersFind} of ${totalUsersFind}`
        : `Showing ${firstUserOfPage} - ${totalUsersFind} of ${totalUsersFind}`
      : `Showing ${firstUserOfPage} - ${lastUserOfPage} of ${totalUsersFind}`;

  return (
    <div
      id="user_table_footer"
      className="table-summary col-md-4 col-sm-4 col-xs-4 ember-view"
      style={{ marginBottom: '25px' }}
    >
      {displayedUsers}
    </div>
  );
});

/**
 * Stateless component to display page links.
 */
const PageLinks = React.memo(props => {
  const onPageSelect = pageNo => {
    props.onPageSelect(pageNo);
  };

  let pageLinks = [];
  let totalPages = parseInt(props.datacount / props.pageSize) + 1;

  /* Start page will be 1 for the first time,  
   and it will change based on the selected page and total page so that we can show the lin for 5 . */
  let startPage =
    totalPages <= NUMBER_OF_PAGE_LINK
      ? 1
      : totalPages - props.selectedPage < NUMBER_OF_PAGE_LINK
      ? totalPages - (NUMBER_OF_PAGE_LINK - 1)
      : props.selectedPage;

  let pageCounter = startPage;

  while (
    pageCounter <
    startPage + (totalPages < NUMBER_OF_PAGE_LINK ? totalPages : NUMBER_OF_PAGE_LINK)
  ) {
    pageLinks.push(
      <PageLinkItem
        pageNo={pageCounter}
        onPageSelect={onPageSelect}
        key={'page-link-' + pageCounter}
        isSelected={props.selectedPage === pageCounter}
      />,
    );

    pageCounter += 1;
  }
  return pageLinks;
});

/**
 * Single page lin item
 */
const PageLinkItem = React.memo(props => {
  return (
    <button
      style={{ fontWeight: props.isSelected ? 'bold' : 'normal' }}
      className="page-no-link link-button"
      onClick={e => {
        e.preventDefault();
        props.onPageSelect(props.pageNo);
      }}
      key={'page-' + props.pageNo}
    >
      {props.pageNo}
    </button>
  );
});

export default UserTableFooter;
