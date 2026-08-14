import PropTypes from 'prop-types';
import { Component } from 'react';
import { Button } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
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
    const { darkMode } = this.props;
    return (
       <div style={{ color: darkMode ? '#fff' : 'inherit' }}>
        <div>
          <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#007bff', textDecoration: 'none' }}>
            Select a Filter
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', color: darkMode ? '#fff' : 'inherit' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '12px' }}>
            <input
              name="radio"
              type="radio"
              style={{ margin: '8px 8px 8px 0' }}
              value="active"
              checked={this.props.filterStatus === 'active'}
              onChange={this.setActive}
            />
            Active
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '12px' }}>
            <input
              name="radio"
              type="radio"
              style={{ margin: '8px 8px 8px 0' }}
              value="inactive"
              checked={this.props.filterStatus === 'inactive'}
              onChange={this.setInActive}
            />
            Inactive
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '12px' }}>
            <input
              name="radio"
              type="radio"
              style={{ margin: '8px 8px 8px 0' }}
              value="all"
              checked={this.props.filterStatus === 'all'}
              onChange={this.setAll}
            />
            All
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <input
              name="radio"
              type="radio"
              style={{ margin: '8px 8px 8px 0' }}
              value="tenHour"
              checked={this.props.filterStatus === 'tenHour'}
              onChange={this.setTenHourFilter}
            />
            10+ hours
          </label>
        </div>
        <Button
            onClick={() => window.location.reload()}
            color="danger"
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Clear All
        </Button>
        </div>
        <div className="mt-4">
          <ReportTableSearchPanel
            onSearch={this.onWildCardSearch}
            wildCardSearchText={this.props.wildCardSearchText}
            onCreateNewTeamClick={this.props.onCreateNewTeamShow}
            onScrollToResults={this.props.scrollToResults}
            onSearchClick={this.props.onSearchClick}
          />
        </div>
      </div>
    );
  }
}
ReportFilter.propTypes = {
  darkMode: PropTypes.bool,
  filterStatus: PropTypes.string,
  setFilterStatus: PropTypes.func,
  onWildCardSearch: PropTypes.func,
  wildCardSearchText: PropTypes.string,
  onCreateNewTeamShow: PropTypes.func,
  scrollToResults: PropTypes.func,
  onSearchClick: PropTypes.func,
};

ReportFilter.defaultProps = {
  darkMode: false,
  filterStatus: 'all',
  setFilterStatus: () => {},
  onWildCardSearch: () => {},
  wildCardSearchText: '',
  onCreateNewTeamShow: () => {},
  scrollToResults: () => {},
  onSearchClick: () => {},
};

export default ReportFilter;
