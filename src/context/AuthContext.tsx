import api from "@/lib/api";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthContextType,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>(
        "/marketing/api/auth/login",
        credentials
      );

      const { token: newToken, user: newUser } = response.data.data;

      // Save to localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      // Update state
      setToken(newToken);
      setUser(newUser);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await api.post<AuthResponse>(
        "/marketing/api/auth/register",
        credentials
      );

      const { token: newToken, user: newUser } = response.data.data;

      // Save to localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      // Update state
      setToken(newToken);
      setUser(newUser);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
