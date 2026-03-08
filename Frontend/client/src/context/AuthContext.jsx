import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { adminEmails } from "../constants/adminList"; // ✅ NEW: Whitelisted emails

const AuthContext = createContext();
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // ✅ NEW

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(adminEmails.includes(currentUser?.email)); // ✅ Check admin email
      setAuthLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    console.log("Auth state changed:", currentUser?.email ?? "No user");
    setUser(currentUser);
    setIsAdmin(
      adminEmails.some(
        (adminEmail) =>
          adminEmail.toLowerCase() === currentUser?.email?.toLowerCase()
      )
    );
    setAuthLoading(false);
  });

  return () => unsubscribe();
}, []);



  return (
    <AuthContext.Provider value={{ user, isAdmin, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const useAuth = () => useContext(AuthContext);
