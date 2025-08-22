import React from 'react';

class DropDownSearchBox extends React.PureComponent {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     selectedValue: '',
  //   };
  // }

  onSelectionChange = event => {
    this.props.searchCallback(event.target.value);
    // this.setState({
    //   selectedValue: event.target.value,
    // });
  };

  render() {
    return (
      <select
        onChange={this.onSelectionChange}
        value={this.props.value}
        id={`search_${this.props.id}`}
        style={{
          padding: '0 0 0 6px',
          cursor: 'pointer',
          width: this.props.width,
          height: '1.81em',
        }}
        className={this.props.className}
      >
        <option value="">All users</option>

        {/* eslint-disable-next-line no-unused-vars */}
        {this.props.items.map((item, index) => {
          return (
            // <option value={item} key={`${item}-${index}`}>
            //  {item}
            // </option>
            <option value={item} key={item}>
              {item}
            </option>
          );
        })}
      </select>
    );
  }
}

export default DropDownSearchBox;
