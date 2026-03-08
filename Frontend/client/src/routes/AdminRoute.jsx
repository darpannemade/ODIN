// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user, isAdmin, authLoading } = useAuth();

  console.log("AdminRoute user:", user?.email);
  console.log("AdminRoute isAdmin:", isAdmin);
  console.log("AdminRoute authLoading:", authLoading);

  if (authLoading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "2rem" }}>
        Loading authentication...
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Show black screen with message instead of redirecting
    return (
      <div
        style={{
          backgroundColor: "black",
          color: "white",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
          fontFamily: "Modrenize, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        ⚠️ You are not an admin.
      </div>
    );
  }

  // User is admin — render child routes/components
  return <Outlet />;
};

export default AdminRoute;
