import { Component } from 'react';
import ReportTableSearchPanel from '../ReportTableSearchPanel';

class ReportFilter extends Component {
  constructor(props) {
    super(props);
    this.setActive = this.setActive.bind(this);
    this.setInActive = this.setInActive.bind(this);
    this.setAll = this.setAll.bind(this);
    this.setTenHourFilter = this.setTenHourFilter.bind(this);
    this.onWildCardSearch = this.onWildCardSearch.bind(this);
  }

  onWildCardSearch(searchText) {
    this.props.onWildCardSearch(searchText);
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

  render() {
    return (
      <div>
        <div>
          <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}>
            Select a Filter
          </button>
        </div>
        <div>
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px', marginLeft: 0 }}
            value="active"
            checked={this.props.filterStatus === 'active'}
            onChange={this.setActive}
          />
          Active
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px' }}
            value="inactive"
            checked={this.props.filterStatus === 'inactive'}
            onChange={this.setInActive}
          />
          Inactive
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px' }}
            value="all"
            checked={this.props.filterStatus === 'all'}
            onChange={this.setAll}
          />
          All
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px' }}
            value="tenHour"
            checked={this.props.filterStatus === 'tenHour'}
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
