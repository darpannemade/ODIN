import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import './ProtectedRoute.css';
const Loading = () => (
  <div style={{ color: "white", textAlign: "center", marginTop: "3rem" }}>
    Loading...
  </div>
);

const NoUser = () => (
  <main
    style={{
      backgroundColor: "black",
      color: "#d4caff",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      fontFamily: "'42dotSans', sans-serif",
      textAlign: "center",
    }}
  >
    <h1 style={{ fontFamily: "Modrenize, sans-serif", fontSize: "2.5rem", marginBottom: "1rem" }}>
      The Bifröst Awaits
    </h1>
    <p style={{ fontSize: "1.2rem", maxWidth: "600px", marginBottom: "2rem" }}>
      To cross the legendary bridge and unlock the secrets beyond, you must first prove your worth by signing in or creating an account.
    </p>

    <nav style={{ display: "flex", gap: "1.5rem" }} aria-label="Authentication actions">
      <Link className="btn btn-primary" to="/login">
        Sign In
      </Link>
      <Link className="btn btn-secondary" to="/register">
        Sign Up
      </Link>
    </nav>
  </main>
);

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) return <Loading />;

  if (!user) return <NoUser />;

  // If children exist, render them, else use Outlet for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
