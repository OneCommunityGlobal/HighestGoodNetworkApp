import React from 'react';

class DropDownSearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: ''
    }
  }

  render() {
    return <select onChange={this.onSelectionChange}>
      <option value={''} >{''}</option>
      {this.props.items.map(item => {
        return <option value={item} >{item}</option>
      })}
    </select>
  }

  onSelectionChange = (event) => {
    this.props.searchCallback(event.target.value);
    this.setState({
      selectedValue: event.target.value
    });
  }
}

export default DropDownSearchBox;