import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";

import api from "../api/client";

const authErrorMessage = (error) =>
  error.response?.data?.message ||
  "Unable to connect to the server. Please try again.";

const AuthContext = createContext();

const TOKEN_KEY = "ss_token";
const USER_KEY = "ss_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Validate the stored token against the server on load.
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      persistSession(data.token, data.user);
      return data.user;
    } catch (error) {
      toast.error(authErrorMessage(error));
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      toast.success(data.message || "Password reset link sent.");
      return data;
    } catch (error) {
      toast.error(authErrorMessage(error));
      throw error;
    }
  };

  const resetPassword = async ({ email, token, newPassword, confirmPassword }) => {
    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        token,
        newPassword,
        confirmPassword,
      });
      toast.success(data.message || "Password reset successful.");
      return data;
    } catch (error) {
      toast.error(authErrorMessage(error));
      throw error;
    }
  };

  const register = async ({ name, phone, email, password, role }) => {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        phone,
        email,
        password,
        role,
      });
      toast.success("Registration successful");
      return data.user;
    } catch (error) {
      toast.error(authErrorMessage(error));
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    toast.success("Logout successful");
  };

  const updateProfile = async ({ name, email }) => {
    try {
      const { data } = await api.put("/auth/profile", { name, email });
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      toast.success("Profile updated");
      return data.user;
    } catch (error) {
      toast.error(authErrorMessage(error));
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(authErrorMessage(error));
      throw error;
    }
  };

  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
