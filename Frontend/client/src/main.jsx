import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from "./context/AuthContext";
import { Web3Provider } from "./context/Web3Context";
import { BrowserRouter } from "react-router-dom";
import { MintProvider } from "./context/MintContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Web3Provider>
            <MintProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#161616',
                    color: '#e8e8e8',
                    border: '1px solid rgba(181,37,26,0.3)',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: '0.95rem',
                    letterSpacing: '0.02em',
                  },
                }}
              />
            </MintProvider>
          </Web3Provider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
