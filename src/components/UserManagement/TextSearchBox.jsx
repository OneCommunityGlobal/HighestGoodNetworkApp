import React from 'react';

class TextSearchBox extends React.PureComponent {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     text: '',
  //   };
  // }

  onTextChange = event => {
    this.props.searchCallback(event.target.value);
    // this.setState({
    //   text: event.target.value,
    // });
  };

  render() {
    return (
      <input
        type="text"
        value={this.props.value}
        // id={'search_' + this.props.id}
        id={`search_${this.props.id}`}
        style={this.props.style}
        onChange={this.onTextChange}
        placeholder={this.props.placeholder}
        className={this.props.className}
      />
    );
  }
}
export default TextSearchBox;
