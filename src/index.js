import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import logService from './services/logService';
import { Provider } from 'react-redux';
import configureStore from './store';

import Loading from '../src/components/common/Loading'
import { PersistGate } from 'redux-persist/integration/react';
const { persistor, store } = configureStore();
logService.init();

ReactDOM.render(
  <Provider store={store}>
  <PersistGate loading={<Loading/>} persistor={persistor}>
  
 
    <Router>
      <App />
    </Router>
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);

registerServiceWorker();
