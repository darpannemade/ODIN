import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NFTAdminPage from '../NFTmarket/NFTAdminPage';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, isAdmin } = useAuth();

  // Debugging: log when component loads
  console.log("Inside AdminDashboard");
  console.log("Logged in user:", user?.email);
  console.log("Is admin:", isAdmin);

  const [activeTab, setActiveTab] = useState('nft');

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Admin Panel</h3>
        <button onClick={() => setActiveTab('nft')}>NFT Admin</button>
        <button onClick={() => setActiveTab('general')}>General Admin</button>
      </div>

      <div className="main-panel">
        {activeTab === 'nft' && <NFTAdminPage />}
        {activeTab === 'general' && (
          <div>
            <h2>General Admin Dashboard</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
