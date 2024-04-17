import React from 'react';

class TextSearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
    };
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <input
          type="text"
          value={this.props.value}
          id={'search_' + this.props.id}
          style={{ ...this.props.style, width: '100%', display: 'inline-block' }}
          onChange={this.onTextChange}
          placeholder={this.props.placeholder}
          className={this.props.className}
        />
      </div>
    );
  }
  

  onTextChange = event => {
    this.props.searchCallback(event.target.value);
    this.setState({
      text: event.target.value,
    });
  };
}

export default TextSearchBox;
