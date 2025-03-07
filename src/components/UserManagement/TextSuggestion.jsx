import React from 'react';

class TextSuggestion extends React.Component {
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
    const options = this.props.list;
    return (
      <>
        <input
          list={this.props.list}
          type="text"
          value={this.props.value}
          // id={'search_' + this.props.id}
          id={`search_${this.props.id}`}
          style={this.props.style}
          onChange={this.onTextChange}
          placeholder={this.props.placeholder}
          className={this.props.className}
        />
        <datalist id={this.props.list}>
          {options.map(item => {
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
            return <option value={item} key={item} />;
          })}
        </datalist>
      </>
    );
  }
}

export default TextSuggestion;
