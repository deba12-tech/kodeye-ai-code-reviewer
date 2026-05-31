import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Eye, EyeOff, Lock, CheckCircle2, ShieldAlert } from "lucide-react";
import { Logo } from "../ui/Logo";
import { GridBackground } from "../ui/grid-background";
import { authService } from "../../services/authService";

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Stale signature. Missing recovery token parameter in request.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Integrity check failed.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid or expired password reset token.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GridBackground className="h-screen w-screen flex items-center justify-center bg-background text-white select-none p-4 overflow-hidden">
      <div className="w-full max-w-[420px] bg-[#0A0A0B]/85 backdrop-blur-2xl rounded-2xl border border-border p-8 shadow-2xl relative overflow-hidden text-left z-10">
        <div className="flex justify-center mb-8">
          <Logo showText={true} />
        </div>

        {isSuccess ? (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success mx-auto shadow-[0_0_15px_rgba(0,230,118,0.15)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white tracking-tight">Credentials Reassigned</h2>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                Your password was updated successfully. All other device sessions have been safely terminated for security.
              </p>
            </div>
            <Button
              onClick={() => navigate("/auth")}
              className="w-full h-10 text-xs font-bold font-mono uppercase tracking-wider bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300 cursor-pointer"
            >
              Sign In Now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 text-center mb-6">
              <h1 className="text-xl font-bold tracking-tight text-white">Reset Password</h1>
              <p className="text-xs text-text-secondary font-semibold">
                Define your new developer signature credentials below.
              </p>
            </div>

            {!token && (
              <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 font-mono uppercase font-bold text-[9px]">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                <span>WARNING: Missing reset token in URL parameters.</span>
              </div>
            )}

            {error && (
              <div className="p-3 text-xs text-critical bg-critical/10 border border-critical/20 rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-critical shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="pass" className="text-xs font-semibold text-text-primary">New Password</Label>
              <div className="relative">
                <Input
                  id="pass"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 bg-surface border-surface-border text-xs focus:border-primary placeholder-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs font-semibold text-text-primary">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 pr-10 bg-surface border-surface-border text-xs focus:border-primary placeholder-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !token || !password || !confirmPassword}
              className="w-full h-11 text-xs font-bold font-mono uppercase tracking-wider bg-primary text-black hover:opacity-90 active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                "Reconfiguring Credentials..."
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Establish New Password
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </GridBackground>
  );
};

export default ResetPasswordPage;
