import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.scss';
import { Provider } from 'react-redux';
import store, { persistor } from './store/store.js';
import {PersistGate} from "redux-persist/integration/react";
import "./utils/i18n"


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
        <PersistGate loading={null} persistor={persistor}>
          <Provider store={store}>
              <App />
          </Provider>
        </PersistGate>
    </Router>
  </React.StrictMode>
);
