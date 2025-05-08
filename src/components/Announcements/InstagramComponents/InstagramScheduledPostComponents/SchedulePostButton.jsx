import React, { Component } from 'react';

class SchedulePostButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: null,
      selectedTime: null,
    };
  }

  handleButtonClick = () => {

  }

  render() {
    return (
      <button 
        className={this.props.className || "schedule-post-button"}
        onClick={this.handleButtonClick}
      >
        {this.props.buttonText || "Schedule Post"}
      </button>
    );
  }

}

