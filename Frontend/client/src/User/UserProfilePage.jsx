import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import "./UserProfile.css";

const UserProfilePage = () => {
  const [user, setUser] = useState({
    username: "",
    bio: "",
    twitter: "",
    instagram: "",
    website: "",
    profileImage: "",
    coverImage: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setUser(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(user));
    setIsEditing(false);
    toast.success("Profile forged in the Aether!");
  };

  const defaultAvatar = "https://res.cloudinary.com/daijhwmiz/image/upload/v1750857697/account1_fwnqv3.png";

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="profile-page page-enter">
      <Toaster position="bottom-right" toastOptions={{ className: 'aether-toast' }} />
      <div className="cosmic-bg" />

      {/* COVER IMAGE */}
      <div className="profile-cover">
        {user.coverImage ? (
          <img src={user.coverImage} alt="Cover" className="cover-img" />
        ) : (
          <div className="cover-placeholder" />
        )}
        <div className="cover-overlay" />
        
        {isEditing && (
          <button 
            className="btn-edit-cover glow-border"
            onClick={() => coverInputRef.current.click()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Change Cover
          </button>
        )}
        <input
          type="file"
          accept="image/*"
          ref={coverInputRef}
          style={{ display: "none" }}
          onChange={(e) => handleImageUpload(e, "coverImage")}
        />
      </div>

      <div className="container profile-container">
        
        {/* HEADER / AVATAR */}
        <motion.div 
          className="profile-header aether-card"
          initial="hidden" animate="visible" variants={fadeUp}
        >
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar glow-border">
              <img src={user.profileImage || defaultAvatar} alt="Profile" />
              {isEditing && (
                <div className="avatar-edit-overlay" onClick={() => profileInputRef.current.click()}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={profileInputRef}
              style={{ display: "none" }}
              onChange={(e) => handleImageUpload(e, "profileImage")}
            />
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <div className="edit-actions">
                <button className="btn-text" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn-aether btn-sm" onClick={handleSave}>Save Changes</button>
              </div>
            ) : (
              <button className="btn-rune btn-sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </motion.div>

        {/* PROFILE BODY */}
        <div className="profile-grid">
          
          {/* LEFT: INFO */}
          <motion.div 
            className="profile-details aether-card"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          >
            <h2 className="card-title">Runesmith Identity</h2>
            <div className="aether-line mt-2 mb-6" />

            {isEditing ? (
              <div className="profile-form">
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    name="username"
                    value={user.username}
                    onChange={handleChange}
                    placeholder="Enter your cosmic name..."
                  />
                </div>
                <div className="form-group mt-4">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={user.bio}
                    onChange={handleChange}
                    placeholder="Tell the realm about your artistry..."
                  />
                </div>
              </div>
            ) : (
              <div className="profile-info-display">
                <h1 className="profile-name">
                  {user.username || "Anonymous Runesmith"}
                </h1>
                <p className="profile-bio text-secondary">
                  {user.bio || "No history written yet. Forging destiny..."}
                </p>
                <div className="forge-tag mt-4">Active Valhalla Member</div>
              </div>
            )}
          </motion.div>

          {/* RIGHT: SOCIAL LINKS */}
          <motion.div 
            className="profile-socials aether-card"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          >
            <h2 className="card-title">Social Portals</h2>
            <div className="aether-line mt-2 mb-6" />

            {isEditing ? (
              <div className="profile-form">
                <div className="form-group">
                  <label>Twitter (X)</label>
                  <input
                    type="text"
                    name="twitter"
                    value={user.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="form-group mt-4">
                  <label>Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    value={user.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="form-group mt-4">
                  <label>Website / Portfolio</label>
                  <input
                    type="text"
                    name="website"
                    value={user.website}
                    onChange={handleChange}
                    placeholder="https://yourrealm.com"
                  />
                </div>
              </div>
            ) : (
              <div className="social-links-display">
                <a href={user.twitter || "#"} target="_blank" rel="noopener noreferrer" className={`social-link-item ${!user.twitter ? 'disabled' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  <span>{user.twitter ? "Twitter Profile" : "Not Linked"}</span>
                </a>
                <a href={user.instagram || "#"} target="_blank" rel="noopener noreferrer" className={`social-link-item ${!user.instagram ? 'disabled' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  <span>{user.instagram ? "Instagram Profile" : "Not Linked"}</span>
                </a>
                <a href={user.website || "#"} target="_blank" rel="noopener noreferrer" className={`social-link-item ${!user.website ? 'disabled' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>{user.website ? "Personal Website" : "Not Linked"}</span>
                </a>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
