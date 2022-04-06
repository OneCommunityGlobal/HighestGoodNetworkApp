import React from 'react';

class DropDownSearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: '',
    };
  }

  render() {
    return (
      <select
        onChange={this.onSelectionChange}
        value={this.props.value}
        id={'search_' + this.props.id}
      >
        <option value={''}>{''}</option>
        {this.props.items.map((item, index) => {
          return (
            <option value={item} key={'search-dropdown-' + index}>
              {item}
            </option>
          );
        })}
      </select>
    );
  }

  onSelectionChange = (event) => {
    this.props.searchCallback(event.target.value);
    this.setState({
      selectedValue: event.target.value,
    });
  };
}

export default DropDownSearchBox;
