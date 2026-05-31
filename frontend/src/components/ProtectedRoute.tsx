import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0A0A0B] flex flex-col items-center justify-center select-none font-mono">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4 shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Decrypting Session Context...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
