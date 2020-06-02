import React from 'react'

const UserTableFooter = React.memo((props) => {
  let pageLinks = [];
  for (let i = 0; i < (props.datacount / props.pageSize); i++) {
    let cssclass = "pagination button ";
    if ((i + 1) === props.selectedPage) { cssclass = cssclass + "active"; }
    pageLinks.push(<a href="javascript:void(0)"
      className={cssclass}
      onClick={() => {
        props.onPageSelect(i + 1)
      }}
      key={'page-' + i}>{i + 1}</a>)
  }

  return <div className="row">
    <div id="user_table_footer" className="table-summary col-md-4 col-sm-4 col-xs-4 ember-view">
      Show {((props.selectedPage - 1) * props.pageSize) + 1} -
      {(props.selectedPage * props.pageSize)} of {props.datacount}
      <a href="#" className="btn btn-link clearFilters" data-ember-action="" data-ember-action-1732="1732">
        <i className="glyphicon glyphicon-remove-circle"></i>
      </a>
    </div>
    <div className="col-md-2 col-sm-2 col-xs-2">
      <div className="pull-right">
        <div id="ember738" className="ember-view">
          <select id="ember739" className="changePageSize form-control ember-view"
            onChange={(e) => { props.onSelectPageSize(parseInt(e.target.value)) }}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
    <div id="ember745" className="table-nav col-md-6 col-sm-6 col-xs-6 ember-view">
      <div role="toolbar" className="btn-toolbar pull-right">
        <div role="group" className="btn-group">
          <button type="button" className=" btn btn-default"
            onClick={(e) => {
              if (props.selectedPage > 1) {
                props.onPageSelect(props.selectedPage - 1)
              }
            }} >Previous</button>
          {pageLinks}
          <button type="button" className="  btn btn-default"
            onClick={(e) => {
              if (props.selectedPage <= parseInt(props.datacount / props.pageSize)) {
                props.onPageSelect(props.selectedPage + 1)
              }
            }}>Next</button>
        </div>
      </div>
    </div>
  </div>
});

export default UserTableFooter;