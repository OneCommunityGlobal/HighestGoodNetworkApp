import PropTypes from 'prop-types';
import { Component } from 'react';
import { Button } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import ReportTableSearchPanel from '../ReportTableSearchPanel';
import styles from '../reportsPage.module.css';

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
       <div className={styles['report-filter-panel']} style={{ color: darkMode ? '#fff' : 'inherit' }}>
        <div className={styles['report-filter-header-row']}>
          <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#007bff', textDecoration: 'none' }}>
            Select a Filter
          </button>
          <Button
            onClick={() => window.location.reload()}
            color="danger"
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Clear All
          </Button>
        </div>
        <div className={styles['report-filter-options-row']} style={{ color: darkMode ? '#fff' : 'inherit' }}>
          <label>
            <input
              name="radio"
              type="radio"
              value="active"
              checked={this.props.filterStatus === 'active'}
              onChange={this.setActive}
            />
            Active
          </label>
          <label>
            <input
              name="radio"
              type="radio"
              value="inactive"
              checked={this.props.filterStatus === 'inactive'}
              onChange={this.setInActive}
            />
            Inactive
          </label>
          <label>
            <input
              name="radio"
              type="radio"
              value="all"
              checked={this.props.filterStatus === 'all'}
              onChange={this.setAll}
            />
            All
          </label>
          <label>
            <input
              name="radio"
              type="radio"
              value="tenHour"
              checked={this.props.filterStatus === 'tenHour'}
              onChange={this.setTenHourFilter}
            />
            10+ hours
          </label>
        </div>
        <div>
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