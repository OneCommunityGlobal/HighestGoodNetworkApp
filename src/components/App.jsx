import { Component } from "react";
import routes from '../routes'
import logger from "../services/logService";

import "../App.css";

class App extends Component {
  state = {};

  componentDidCatch(error, errorInfo) {
    logger.logError(error);
  }

  render() {
    return (
     routes
 
    );
  }
}

export default App;