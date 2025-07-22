import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";
import { marketplaceAddress } from "../config";
import { marketplaceABI } from "../NFTmarket/MarketplaceABI";

const UserProfilePage = () => {
  const { user, isAdmin, walletAddress } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    profilePicture: null,
    bannerImage: null,
    walletAddress: "",
    preferredBlockchain: "",
    tradingPreference: "",
    bio: "",
    twitter: "",
    discord: "",
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem(`profile:${walletAddress}`);
    if (savedProfile) {
      const data = JSON.parse(savedProfile);
      setFormData({ ...data });
    } else if (walletAddress) {
      setFormData(prev => ({ ...prev, walletAddress }));
    }
  }, [walletAddress]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [field]: url }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.walletAddress) errs.walletAddress = "Wallet address is required";
    if (!formData.username) errs.username = "Username is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      localStorage.setItem(`profile:${walletAddress}`, JSON.stringify(formData));
      setShowSuccess(true);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        {formData.bannerImage && (
          <div className="profile-banner-preview">
            <img src={formData.bannerImage} alt="Banner" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-form">
          <h1 className="profile-heading">Your Odin Profile</h1>

          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>

            <div className="form-group full">
              <label>Wallet Address</label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              {errors.walletAddress && <span className="error">{errors.walletAddress}</span>}
            </div>

            <div className="form-group full">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                placeholder="Tell us something about you..."
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Preferred Blockchain</label>
              <select
                name="preferredBlockchain"
                value={formData.preferredBlockchain}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="">Select</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="solana">Solana</option>
              </select>
            </div>

            <div className="form-group">
              <label>Trading Preference</label>
              <select
                name="tradingPreference"
                value={formData.tradingPreference}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="">Select</option>
                <option value="collector">Collector</option>
                <option value="trader">Trader</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="form-group">
              <label>Twitter</label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="@yourhandle"
              />
            </div>

            <div className="form-group">
              <label>Discord</label>
              <input
                type="text"
                name="discord"
                value={formData.discord}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="user#1234"
              />
            </div>


          </div>

          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" />
              ) : (
                <i className="fas fa-camera avatar-icon"></i>
              )}
            </div>

            {isEditing && (
              <label htmlFor="profile-picture" className="avatar-upload">
                <i className="fas fa-camera"></i>
                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "profilePicture")}
                  hidden
                />
              </label>
            )}
          </div>

          {isEditing && (
            <div className="form-group full">
              <label>Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "bannerImage")}
              />
            </div>
          )}

          <div className="form-actions">
            {!isEditing ? (
              <button type="button" className="btn primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const saved = JSON.parse(localStorage.getItem(`profile:${walletAddress}`));
                    if (saved) setFormData(saved);
                    setIsEditing(false);
                  }}
                  className="btn secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn primary">
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </>
            )}
          </div>
        </form>

        {showSuccess && (
          <div className="success-popup">
            <div className="success-box">
              <div className="success-header">
                <h3>
                  <i className="fas fa-check-circle" style={{ color: "#4ade80" }}></i> Success!
                </h3>
                <i className="fas fa-times close-btn" onClick={() => setShowSuccess(false)}></i>
              </div>
              <p>Your profile has been saved.</p>
              <button onClick={() => setShowSuccess(false)} className="btn primary">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
