import { createRoot } from 'react-dom/client';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import logService from './services/logService';

logService.init();

const root = createRoot(document.getElementById('root'));
root.render(<App />);

registerServiceWorker();
