import React from 'react';

class DropDownSearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: '',
    };
  }

  onSelectionChange = event => {
    const { searchCallback } = this.props;
    searchCallback(event.target.value);
    this.setState({
      selectedValue: event.target.value,
    });
  };

  render() {
    const { value, id, width, className, placeholder, items } = this.props;
    return (
      <select
        onChange={this.onSelectionChange}
        value={value}
        id={`search_${id}`}
        style={{ padding: '0 0 0 6px', cursor: 'pointer', width }}
        className={className}
      >
        <option value="" style={{ color: '#9b9b9b' }}>
          {placeholder}
        </option>
        {items.map((item, index) => {
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
