import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import logService from './services/logService';

logService.init();

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();
