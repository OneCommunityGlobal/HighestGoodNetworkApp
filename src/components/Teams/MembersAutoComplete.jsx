import React, { Component } from "react";
import { Button } from 'reactstrap';
import PropTypes from "prop-types";
import './MembersAutoComplete.css';

export class MembersAutocomplete extends Component {
  // static propTypes = {
  //   suggestions: PropTypes.instanceOf(Array)
  // };
  // static defaultProperty = {
  //   suggestions: []
  // };
  constructor(props) {
    super(props);
    this.state = {
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: ""
    };
  }
  debugger;
  onChange = e => {
    const { suggestions } = this.props;
    const userInput = e.currentTarget.value;

    const filteredSuggestions = suggestions.filter(
      suggestion =>
        suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );
    // const filteredSuggestions = suggestions.filter(
    //   (suggestion) => {
    //     if (suggestion.firstName &&
    //       suggestion.firstName.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    //     )
    //       return suggestion
    //   }

    // );

    this.setState({
      activeSuggestion: 0,
      filteredSuggestions,
      showSuggestions: true,
      userInput: e.currentTarget.value
    });
  };

  onClick = e => {
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: e.currentTarget.innerText
    });
  };
  onKeyDown = e => {
    const { activeSuggestion, filteredSuggestions } = this.state;

    if (e.keyCode === 13) {
      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
        userInput: filteredSuggestions[activeSuggestion]
      });
    } else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion - 1 });
    } else if (e.keyCode === 40) {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion + 1 });
    }
  };

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,
      state: {
        activeSuggestion,
        filteredSuggestions,
        showSuggestions,
        userInput
      }
    } = this;
    let suggestionsListComponent;
    if (showSuggestions && userInput) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <ul class="suggestions">
            {filteredSuggestions.map((suggestion, index) => {
              let className;

              if (index === activeSuggestion) {
                className = "";
              }

              return (
                <li key={suggestion} onClick={onClick} id="list">
                  {suggestion}
                </li>
              );
            })}
          </ul>
        );
      } else {
        suggestionsListComponent = (
          <div class="no-suggestions">
            <em>No suggestions</em>
          </div>
        );
      }
    }

    return (
      <React.Fragment>
        <div>
          <input
            type="search"
            className="form-control"
            aria-label="Search"
            placeholder="Add Member"
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={userInput}
          />
        </div>
        <Button color="primary">Add</Button>
        <div>

        </div>

      </React.Fragment>
    );
  }
}

export default MembersAutocomplete;

// import React from 'react';
// import { Button } from 'reactstrap';
// // import countries from './Countries';
// // import './App.css';
// debugger;
// export default class MembersAutoComplete extends React.Component {

//   constructor(props) {
//     super(props)
//     this.state = {
//       suggestions: [],
//       text: ''
//     }
//   }



//   onTextChange = (e) => {
//     const { dataList } = this.props;
//     const value = e.target.value;
//     let suggestions = [];
//     if (value.length > 0) {
//       const regex = new RegExp(`^${value}`, 'i');

//       suggestions = dataList.userProfiles.sort().filter(v => regex.test(v))

//     }

//     this.setState(() => ({
//       suggestions,
//       text: value
//     }))
//   }

//   selectedText(value) {
//     this.setState(() => ({
//       text: value,
//       suggestions: [],
//     }))
//   }

//   renderSuggestions = () => {
//     let { suggestions } = this.state;
//     if (suggestions.length === 0) {
//       return null;
//     }
//     return (
//       <ul >
//         {
//           suggestions.map((item, index) => (<li key={index} onClick={() => this.selectedText(item)}>{item}</li>))
//         }
//       </ul>
//     );
//   }

//   render() {

//     const { text, suggestions } = this.state;

//     return (
//       <div id="notebooks" className="input-group-prepend" >

//         <input id="query" className="form-control" type="text" onChange={this.onTextChange} value={text} />
//         {this.renderSuggestions()}
//         <Button color="primary">Add</Button>
//         {/* <span>Suggestions: {suggestions.length}</span> */}
//       </div>
//     );
//   }

// }
