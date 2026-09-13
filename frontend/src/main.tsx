import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth';
import { ConfirmationProvider } from './confirmation';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><AuthProvider><ConfirmationProvider><App/></ConfirmationProvider></AuthProvider></BrowserRouter></React.StrictMode>);
