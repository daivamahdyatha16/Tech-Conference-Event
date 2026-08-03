import { useState } from "react";
import type { ReactNode } from "react";
import {
  login as loginApi,
  register as registerApi,
} from "../api/auth.api";
import type { AuthUser, LoginPayload, RegisterPayload } from "../api/auth.api";
import { AuthContext } from "./auth-context";

const getStoredUser = (): AuthUser | null => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (storedToken && storedUser) {
    return JSON.parse(storedUser);
  }

  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [loading] = useState(false);

  const login = async (payload: LoginPayload) => {
    const response = await loginApi(payload);
    const { token, user: loggedInUser } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  };

  const register = async (payload: RegisterPayload) => {
    await registerApi(payload);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
