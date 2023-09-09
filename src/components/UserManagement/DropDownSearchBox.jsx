import React from 'react';

class DropDownSearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: '',
    };
  }

  onSelectionChange = event => {
    this.props.searchCallback(event.target.value);
    this.setState({
      selectedValue: event.target.value,
    });
  };

  render() {
    return (
      <select
        onChange={this.onSelectionChange}
        value={this.props.value}
        id={`search_${this.props.id}`}
        style={{ padding: '0 0 0 6px', cursor: 'pointer', width: this.props.width }}
        className={this.props.className}
      >
        <option value="" style={{ color: '#9b9b9b' }}>
          {this.props.placeholder}
        </option>
        {this.props.items.map((item, index) => {
          return (
            <option value={item} key={`search-dropdown-${index}`}>
              {item}
            </option>
          );
        })}
      </select>
    );
  }
}

export default DropDownSearchBox;
