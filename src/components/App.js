import React, { Component } from 'react';
import Header from '../common/Header';
import {Route} from 'react-router-dom';
import '../App.css';
import DashBoardPage from './DashBoard/DashBoardPage';
import TimelogPage from './Timelog/TimelogPage';
import LoginPage from './Login/LoginPage';



const Routes = () => {
  return (
    <div>
      <Route exact path="/" component={DashBoardPage} />
      <Route path="/Login" component={LoginPage} />
      <Route path="/DashBoard" component={DashBoardPage} />
      <Route path="/Timelog" component={TimelogPage} />
    </div>
  );
}

class App extends Component {
  render() {
    return (
      <div>
          <Header />
          <Routes/>
      </div>
    );
  }
}


export default App;
