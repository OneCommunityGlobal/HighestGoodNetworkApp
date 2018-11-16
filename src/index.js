import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/css/font-awesome.css'
import logService from "./services/logService"

logService.init();
localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI1YWUwYWZjYWIzZjEyNDFjMjhjOWI0ZTIiLCJyb2xlIjoiVm9sdW50ZWVyIiwiZXhwaXJ5VGltZXN0YW1wIjoiMjAxOC0xMS0yNlQxNjo0NDoyNC4wMjVaIiwiaWF0IjoxNTQyMzg2NjY0fQ.ZbQfN-EN5DZy28-t1ZBbtCWq_jumW4MvAWy4iwhzrxc");
alert(`set value as ${localStorage.getItem("token")}`);

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
