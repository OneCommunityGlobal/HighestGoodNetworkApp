import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
// import $ from 'jquery';
// import popper from 'popper.js';
import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap/dist/js/bootstrap.js';
import 'font-awesome/css/font-awesome.css';
import logService from './services/logService';

logService.init();

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();
