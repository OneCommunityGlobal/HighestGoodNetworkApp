import { Component } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../Header/DarkMode.css'

class ViewReportByDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(this.props.minDate),
      endDate: new Date(),
    };

    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
  }

  onStartDateChange(date) {
    if (date > new Date(this.props.minDate) && date <= this.state.endDate) {
      this.setState({ startDate: date });
      this.props.onDateChange({ startDate: date, endDate: this.state.endDate });
    }
  }

  onEndDateChange(date) {
    if (date >= this.state.startDate) {
      this.setState({ endDate: date });
      this.props.onDateChange({ startDate: this.state.startDate, endDate: date });
    }
  }

  render() {
    const { minDate, maxDate, textColor, darkMode } = this.props;

    return (
      <div className={`date-picker-container ${darkMode ? 'dark-mode' : ''}`}>
        <div id="task_startDate" className="date-picker-item">
          <label htmlFor="task_startDate" className={`date-picker-label ${textColor}`}>
            Start Date
          </label>
          <DatePicker
            selected={this.state.startDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={this.onStartDateChange}
            className="form-control"
            popperPlacement="top-start"
          />
        </div>
        <div id="task_EndDate" className="date-picker-item">
          <label htmlFor="task_EndDate" className={`date-picker-label ${textColor}`}>
            End Date
          </label>
          <DatePicker
            selected={this.state.endDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={this.onEndDateChange}
            className="form-control"
            popperPlacement="top"
          />
        </div>
      </div>
    );
  }
}

export default ViewReportByDate;
