// index.js
import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import App from './App'; // Your main application component
import store from './redux/store';
import { name as appName } from './app.json';
import { createRealmContext } from '@realm/react';
import Realm from 'realm';
import User from './RealmDB/UserModel';


// Create a configuration object


const ReduxApp = () => (
  
  

  <Provider store={store}>
      <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => ReduxApp);
