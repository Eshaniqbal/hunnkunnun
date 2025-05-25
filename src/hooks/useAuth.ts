
"use client";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This check is important for ensuring the hook is used correctly.
    // However, AuthProvider now renders a loading state until context is available,
    // so direct consumer might not hit this if AuthProvider is correctly placed.
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
