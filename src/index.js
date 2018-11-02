import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter, Route } from 'react-router-dom'
import Acquire from './containers/Acquire'
import Explore from './containers/Explore'
import GovernNew from './containers/GovernNew'
import Operationalize from './containers/Operationalize'
import Monitor from './containers/Monitor'
import About from './containers/About'
import './index.css'
import './component.css'

import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'

const store = createStore(rootReducer)

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <div>
                <App />
                <Route exact path="/" component={Acquire} />
                <Route path="/acquire" render={(props) => (<Acquire {...props} state={window.nodes} />)} />
                <Route path="/explore" component={Explore} />
                <Route path="/governNew" component={GovernNew} />
                <Route path="/operationalize" component={Operationalize} />
                <Route path="/monitor" component={Monitor} />
                <Route path="/about" component={About} />
            </div>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root'));
registerServiceWorker();


// Global functions
window.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
}

window.uuidToNum = uuid => {
    return parseInt(uuid.replace(/\D/g,'').substring(0,5));
}

window.uuidToNumString = uuid => {
    return uuid.replace(/\D/g,'').substring(0,5);
}
