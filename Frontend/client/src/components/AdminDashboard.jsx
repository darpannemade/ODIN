import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NFTAdminPage from '../NFTmarket/NFTAdminPage';
import { motion } from 'framer-motion';
import './AdminDashboard.css';

const tabs = [
  { id: 'nft', label: 'NFT Admin', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { id: 'general', label: 'General', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
];

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('nft');

  const sidebarVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="admin-shell page-enter">
      <div className="cosmic-bg" />
      
      {/* SIDEBAR */}
      <motion.aside 
        className="admin-sidebar glass"
        initial="hidden" animate="visible" variants={sidebarVariants}
      >
        <div className="admin-sidebar-header text-center mb-8">
          <div className="nav-brand-rune mx-auto mb-4" style={{ width: 48, height: 48 }} />
          <p className="admin-sidebar-title font-display text-xl text-primary font-bold tracking-widest uppercase">Command</p>
          <p className="admin-sidebar-sub text-aurora text-xs tracking-widest uppercase mt-1">Eye of Odin</p>
        </div>

        <div className="aether-line mx-auto mb-8" style={{ width: '60%' }} />

        <nav className="admin-nav flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                <path d={tab.icon}/>
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-status mt-auto pt-8 border-t border-white/5 text-center">
          <div className="text-xs uppercase tracking-widest text-muted mb-2">Current Sentinel</div>
          <div className="wallet-pill mx-auto justify-center" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <span className="dot rgb-success flex-shrink-0" />
            <span className="address text-xs truncate" title={user?.email || 'Admin'}>
              {user?.email?.split('@')[0] || 'Admin'}
            </span>
          </div>
        </div>
      </motion.aside>

      {/* MAIN */}
      <div className="admin-main">
        <div className="admin-panel-header aether-card mb-8 flex justify-between items-center py-4 px-6">
          <h2 className="admin-panel-title font-display text-xl font-bold tracking-widest uppercase m-0 flex items-center gap-3">
            <span className="text-violet">⚡</span>
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <span className={`admin-panel-badge uppercase text-xs tracking-widest px-3 py-1 rounded-full font-mono border ${isAdmin ? 'bg-success/10 text-success border-success/30' : 'bg-error/10 text-error border-error/30'}`}>
            {isAdmin ? 'Authorized' : 'Read Only'}
          </span>
        </div>

        {activeTab === 'nft' && <NFTAdminPage />}

        {activeTab === 'general' && (
          <div className="admin-coming-soon aether-card text-center py-20">
            <div className="nav-brand-rune opacity-30 mx-auto mb-6" style={{ width: 64, height: 64 }} />
            <h2 className="font-display text-2xl mb-2">Domain Forging</h2>
            <p className="text-muted text-sm tracking-widest uppercase">This section of the Aether is still under construction.</p>
          </div>
        )}
      </div>
    </div>
  );
}
