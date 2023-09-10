import React from 'react';

class TextSearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
    };
  }

  onTextChange = event => {
    this.props.searchCallback(event.target.value);
    this.setState({
      text: event.target.value,
    });
  };

  render() {
    const { value, id, style, placeholder, className } = this.props;
    return (
      <input
        type="text"
        value={value}
        id={`search_${id}`}
        style={style}
        onChange={this.onTextChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }
}

export default TextSearchBox;
