import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from "./context/AuthContext";
import { Web3Provider } from "./context/Web3Context"; 
import { BrowserRouter } from "react-router-dom";
import { MintProvider } from "./context/MintContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Web3Provider>
          <MintProvider>
          <App />
          </MintProvider>
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
