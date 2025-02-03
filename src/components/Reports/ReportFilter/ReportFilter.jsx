import React, { Component } from 'react';
import ReportTableSearchPanel from '../ReportTableSearchPanel';

class ReportFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wildCardSearchText: '',
      teamNameSearchText: '',
    };

    this.setActive = this.setActive.bind(this);
    this.setInActive = this.setInActive.bind(this);
    this.setAll = this.setAll.bind(this);
    this.setTenHourFilter = this.setTenHourFilter.bind(this);
    this.onWildCardSearch = this.onWildCardSearch.bind(this);
  }

  setActive() {
    this.props.setFilterStatus('active');
  }

  setInActive() {
    this.props.setFilterStatus('inactive');
  }

  setAll() {
    this.props.setFilterStatus('all');
  }

  setTenHourFilter(){
    this.props.setFilterStatus('tenHour');
  }

  onWildCardSearch(searchText) {
    this.setState({ wildCardSearchText: searchText });
    this.props.onWildCardSearch(searchText);
  }

  render() {
    return (
      <div>
        <div>
          <a>Select a Filter</a>
        </div>
        <div>
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px', marginLeft: 0 }}
            value="active"
            onChange={this.setActive}
          />
          Active
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px' }}
            value="inactive"
            onChange={this.setInActive}
          />
          Inactive
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px' }}
            value="all"
            onChange={this.setAll}
            defaultChecked
          />
          All
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px' }}
            value="tenHour"
            onChange={this.setTenHourFilter}
          />
          10+ hours
        </div>
        <div className="mt-4">
          <ReportTableSearchPanel
            onSearch={this.onWildCardSearch}
            wildCardSearchText={this.props.wildCardSearchText}
            onCreateNewTeamClick={this.props.onCreateNewTeamShow}
          />
        </div>
      </div>
    );
  }
}

export default ReportFilter;
