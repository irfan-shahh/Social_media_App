import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import DataProvider from './context/DataProvider';
import PostProvider from './context/PostProvider';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    
    <BrowserRouter>
    <DataProvider>
    <PostProvider>
  
    <App />
        
    </PostProvider>
    </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);

