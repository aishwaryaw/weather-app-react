import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import firebase from 'firebase/app';

// Initializing firebase using app's Firebase configuration
 firebase.initializeApp({
  apiKey: "firebase_api_key",
  authDomain: "appdomain.firebaseapp.com",
  projectId: "projectID",
  storageBucket: "project.appspot.com",
  messagingSenderId: "id",
  appId: "appId"
});


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
