import { Component } from 'react';
import DatePicker from 'react-datepicker';
import { Button } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import 'react-datepicker/dist/react-datepicker.css';
import '../../Header/DarkMode.css';

class ViewReportByDate extends Component {
  constructor(props) {
    super(props);
    const { minDate } = props;
    this.state = {
      startDate: new Date(minDate),
      endDate: new Date(),
    };

    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
    this.clearDates = this.clearDates.bind(this);
  }

  onStartDateChange(date) {
    const { minDate, onDateChange } = this.props;
    const { endDate } = this.state;
    if (date > new Date(minDate) && date <= endDate) {
      this.setState({ startDate: date });
      onDateChange({ startDate: date, endDate });
    }
  }

  onEndDateChange(date) {
    const { startDate } = this.state;
    const { onDateChange } = this.props;
    if (date >= startDate) {
      this.setState({ endDate: date });
      onDateChange({ startDate, endDate: date });
    }
  }

  clearDates() {
    const { minDate, onClearFilters } = this.props;
    this.setState({
      startDate: new Date(minDate),
      endDate: new Date(),
    });
    onClearFilters();
  }

  render() {
    const { minDate, maxDate, textColor, darkMode } = this.props;
    const { startDate, endDate } = this.state;

    return (
      <div className={`date-picker-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="date-picker-item">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
          <label htmlFor="task_startDate" className={`date-picker-label ${textColor}`}>
            Start Date
          </label>
          <DatePicker
            id="task_startDate"
            selected={startDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={this.onStartDateChange}
            className={`form-control ${darkMode ? "bg-darkmode-liblack text-light border-0" : ''}`}
            popperPlacement="top-start"
          />
        </div>
        <div className="date-picker-item">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
          <label htmlFor="task_endDate" className={`date-picker-label ${textColor}`}>
            End Date
          </label>
          <DatePicker
            id="task_endDate"
            selected={endDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={this.onEndDateChange}
            className={`form-control ${darkMode ? "bg-darkmode-liblack text-light border-0" : ''}`}
            popperPlacement="top"
          />
        </div>
        <div className="date-picker-item">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
          <label htmlFor="task_EndDate" className={`date-picker-label ${textColor}`} />
          <Button
            id="task_EndDate"
            onClick={this.clearDates}
            color="danger"
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Clear
          </Button>
        </div>
      </div>
    );
  }
}

export default ViewReportByDate;
