import { Component } from "react";
import routes from '../routes'
import logger from "../services/logService";

<<<<<<< HEAD
import ProtectedRoute from './common/ProtectedRoute'

import logger from "../services/logService"

import '../App.css';

class App extends Component {
=======
import "../App.css";

class App extends Component {
  state = {};

  // componentDidMount() {
  //   const user = getCurrentUser();
  //   this.setState({ user });
  // }

>>>>>>> master
  componentDidCatch(error, errorInfo) {
    logger.logError(error);
  }

  render() {
    return (
<<<<<<< HEAD
      <React.Fragment>
        <Header />
        <ToastContainer />
        <Switch>
          <ProtectedRoute path="/dashboard" exact component={Dashboard} />
          <ProtectedRoute path="/timelog/:userId" exact component={Timelog} />
          <ProtectedRoute path="/Reports" exact component={Reports} />
          <Route path="/login" component={Login} />
          <ProtectedRoute path="/profile/:userId" component={Profile} />
          <Route path="/Logout" component={Logout} />
          <Route
            path="/forcePasswordUpdate/:userId"
            component={ForcePasswordUpdate}
          />
          <ProtectedRoute path="/" exact component={Dashboard} />
        </Switch>
      </React.Fragment>
=======
     routes
 
>>>>>>> master
    );
  }
}

export default App;


