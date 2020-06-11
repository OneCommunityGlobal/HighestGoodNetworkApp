import React from 'react';

class TextSearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    }
  }

  render() {
    return <input type="text" id={this.props.id}
      style={this.props.style}
      onChange={this.onTextChange}></input>
  }

  onTextChange = (event) => {
    this.props.searchCallback(event.target.value);
    this.setState({
      text: event.target.value
    });
  }
}

export default TextSearchBox;